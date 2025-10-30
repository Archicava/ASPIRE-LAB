'use client';

import { AuthProvider } from '@/components/auth-context';
import { ToastProvider } from '@/components/toast';
import { StatusProvider } from '@/lib/contexts/status-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StatusProvider>
        <ToastProvider>{children}</ToastProvider>
      </StatusProvider>
    </AuthProvider>
  );
}

