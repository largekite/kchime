'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/shared/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
