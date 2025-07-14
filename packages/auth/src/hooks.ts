'use client';

import { useSession as useNextAuthSession, signIn, signOut } from 'next-auth/react';
import type { ExtendedSession } from './authOptions';

export function useSession() {
  const session = useNextAuthSession();
  return {
    ...session,
    data: session.data as ExtendedSession | null,
  };
}

export { signIn, signOut };