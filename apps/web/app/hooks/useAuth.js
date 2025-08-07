'use client';

import { useSupabaseAuth } from '@bluenote/supabase-auth';

// @bluenote/auth의 useAuth와 호환되는 인터페이스 제공
export function useAuth() {
  const { session, loading, signOut } = useSupabaseAuth();
  
  return {
    user: session?.user || null,
    status: loading ? 'loading' : (session ? 'authenticated' : 'unauthenticated'),
    signIn: () => {
      // Supabase Auth에서는 직접 signIn 페이지로 리다이렉트
      window.location.href = '/auth/signin';
    },
    signOut
  };
}

export { useAuth as useNextAuth };