import { createContext, useContext } from 'react';

export type ToastTone = 'default' | 'success' | 'info';

export interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
