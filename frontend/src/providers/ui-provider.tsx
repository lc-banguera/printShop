import type { ReactNode } from 'react';
import { ToastProvider } from '@/shared/components/Toast/Toast';

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
