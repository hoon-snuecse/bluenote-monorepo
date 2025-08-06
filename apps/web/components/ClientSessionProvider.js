'use client';

import { useSession } from '@/app/components/SupabaseAuthProvider';

export function ClientSessionProvider({ children }) {
  const { data: session, status } = useSession();
  
  return children({ session, status });
}