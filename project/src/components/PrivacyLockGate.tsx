import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from './Icon';
import { LogoMark, Wordmark } from './LogoMark';
import { usePrivacyLock } from '../hooks';
import { hashPin } from '../utils/security';

const SESSION_KEY = 'aequimens.sessionUnlocked';

export function PrivacyLockGate({ children }: { children: React.ReactNode }) {
  const { settings } = usePrivacyLock();
  const [locked, setLocked] = useState(() => settings.enabled && sessionStorage.getItem(SESSION_KEY) !== 'true');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!settings.enabled) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setLocked(false);
      return;
    }
    if (sessionStorage.getItem(SESSION_KEY) !== 'true') setLocked(true);
  }, [settings.enabled]);

  const autoLockMs = useMemo(() => Math.max(1, settings.autoLockMinutes) * 60_000, [settings.autoLockMinutes]);

  useEffect(() => {
    if (!settings.enabled || locked) return;
    let timer = window.setTimeout(() => {
      sessionStorage.removeItem(SESSION_KEY);
      setLocked(true);
    }, autoLockMs);

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setLocked(true);
      }, autoLockMs);
    };

    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [autoLockMs, locked, settings.enabled]);

  const unlock = useCallback(async () => {
    if (!settings.pinHash) return;
    const candidate = await hashPin(pin);
    if (candidate !== settings.pinHash) {
      setError('That PIN does not match.');
      setPin('');
      return;
    }
    sessionStorage.setItem(SESSION_KEY, 'true');
    setLocked(false);
    setError('');
    setPin('');
  }, [pin, settings.pinHash]);

  if (!settings.enabled || !locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-canvas px-5 py-8">
      <div className="w-full max-w-sm rounded-[32px] border border-silver bg-white p-7 text-center shadow-soft-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-olive-tint text-olive-primary shadow-soft">
          <LogoMark size={54} />
        </div>
        <Wordmark size={14} className="mx-auto mt-5 text-ink" />
        <h1 className="mt-5 text-2xl font-bold text-ink">Private space locked</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">Enter your local Aequimens PIN to continue.</p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(event) => {
            setPin(event.target.value.replace(/\D/g, '').slice(0, 6));
            setError('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && pin.length >= 4) void unlock();
          }}
          placeholder="••••"
          aria-label="Aequimens PIN"
          className="mt-6 w-full rounded-2xl border border-silver bg-silver-light/40 px-4 py-4 text-center text-2xl tracking-[0.5em] text-ink focus:border-olive-primary focus:outline-none"
        />
        {error && <p className="mt-2 text-xs font-medium text-olive-deep">{error}</p>}
        <button onClick={() => void unlock()} disabled={pin.length < 4} className="btn-primary mt-5 w-full"><Icon name="KeyRound" size={17} /> Unlock</button>
        <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">This PIN is a casual privacy barrier for shared devices, not full device encryption.</p>
      </div>
    </div>
  );
}

