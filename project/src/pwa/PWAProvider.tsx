import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Icon } from '../components/Icon';
import { useToast } from '../hooks/useToast';
import { PWAContext, type InstallOutcome, type PWAContextValue } from './usePWA';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as NavigatorWithStandalone).standalone)
  );
}

export function PWAProvider({ children }: { children: ReactNode }) {
  const { show } = useToast();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneMode);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Aequimens service worker registration failed:', error);
    },
  });

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      if (!isStandaloneMode()) {
        setInstallPrompt(event as BeforeInstallPromptEvent);
      }
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      show('Aequimens was installed successfully', 'success');
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [show]);

  useEffect(() => {
    if (!offlineReady) return;
    show('Aequimens is ready to work offline', 'success');
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady, show]);

  const install = useCallback(async (): Promise<InstallOutcome> => {
    if (!installPrompt || isInstalled) return 'unavailable';

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }

    return choice.outcome;
  }, [installPrompt, isInstalled]);

  const value = useMemo<PWAContextValue>(
    () => ({
      canInstall: Boolean(installPrompt) && !isInstalled,
      isInstalled,
      isOffline,
      install,
    }),
    [installPrompt, install, isInstalled, isOffline],
  );

  return (
    <PWAContext.Provider value={value}>
      {children}

      {isOffline && (
        <div
          className="fixed inset-x-3 top-3 z-[80] mx-auto max-w-xl rounded-2xl border border-silver bg-white/95 px-4 py-3 shadow-soft-lg backdrop-blur-md safe-top"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-olive-primary">
              <Icon name="WifiOff" size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">You are offline</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                Saved check-ins, missions, and local features remain available on this device.
              </p>
            </div>
          </div>
        </div>
      )}

      {needRefresh && (
        <div className="fixed inset-x-3 bottom-24 z-[75] mx-auto max-w-lg rounded-3xl border border-silver bg-white/95 p-4 shadow-soft-lg backdrop-blur-md md:bottom-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-xl bg-olive-tint p-2 text-olive-deep">
              <Icon name="RefreshCw" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">A new version of Aequimens is available.</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Updating will keep your locally stored wellness data.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void updateServiceWorker(true)}
                  className="btn-primary !rounded-xl !px-4 !py-2 text-sm"
                >
                  Update now
                </button>
                <button
                  type="button"
                  onClick={() => setNeedRefresh(false)}
                  className="btn-secondary !rounded-xl !px-4 !py-2 text-sm"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
}
