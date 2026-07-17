import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

interface Toast {
  id: number;
  message: string;
  tone: 'default' | 'success' | 'info';
}

interface ToastContextValue {
  show: (message: string, tone?: Toast['tone']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, tone: Toast['tone'] = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto animate-slideUp rounded-2xl border border-silver bg-white px-4 py-3 shadow-soft-lg"
          >
            <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
              <span
                className={
                  t.tone === 'success'
                    ? 'text-olive-primary'
                    : t.tone === 'info'
                      ? 'text-olive-deep'
                      : 'text-ink-soft'
                }
              >
                <Icon
                  name={t.tone === 'success' ? 'CheckCircle' : t.tone === 'info' ? 'Info' : 'Bell'}
                  size={18}
                />
              </span>
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
