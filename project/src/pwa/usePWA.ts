import { createContext, useContext } from 'react';

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

export interface PWAContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  install: () => Promise<InstallOutcome>;
}

export const PWAContext = createContext<PWAContextValue | null>(null);

export function usePWA(): PWAContextValue {
  const context = useContext(PWAContext);
  if (!context) throw new Error('usePWA must be used within PWAProvider');
  return context;
}
