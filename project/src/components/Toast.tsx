import { useCallback, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { ToastContext, type ToastTone } from '../hooks/useToast';

interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((message: string, tone: ToastTone = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto animate-slideUp rounded-2xl border border-silver bg-white px-4 py-3 shadow-soft-lg"
          >
            <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
              <span
                className={
                  toast.tone === 'success'
                    ? 'text-olive-primary'
                    : toast.tone === 'info'
                      ? 'text-olive-deep'
                      : 'text-ink-soft'
                }
              >
                <Icon
                  name={toast.tone === 'success' ? 'CheckCircle' : toast.tone === 'info' ? 'Info' : 'Bell'}
                  size={18}
                />
              </span>
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
