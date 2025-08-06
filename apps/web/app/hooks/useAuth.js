'use client';

import { useSession, signOut } from '@/app/components/SupabaseAuthProvider';

// @bluenote/auth의 useAuth와 호환되는 인터페이스 제공
export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    status,
    signIn: () => {
      // Supabase Auth에서는 직접 signIn 페이지로 리다이렉트
      window.location.href = '/auth/signin';
    },
    signOut
  };
}

export { useAuth as useNextAuth };