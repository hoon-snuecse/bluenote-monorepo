'use client';

import { SupabaseAuthProvider } from '@bluenote/supabase-auth';
import { AuthSyncProvider } from './AuthSyncProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <AuthSyncProvider>
        {children}
      </AuthSyncProvider>
    </SupabaseAuthProvider>
  );
}