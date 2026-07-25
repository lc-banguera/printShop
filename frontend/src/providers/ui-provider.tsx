import type { ReactNode } from 'react';

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  return <>{children}</>;
}
