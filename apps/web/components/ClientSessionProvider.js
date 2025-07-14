'use client';

import { useSession } from 'next-auth/react';

export function ClientSessionProvider({ children }) {
  const { data: session, status } = useSession();
  
  return children({ session, status });
}