'use client';

import { useSupabaseAuth } from '@bluenote/supabase-auth';

// @bluenote/auth의 useAuth와 호환되는 인터페이스 제공
export function useAuth() {
  const { session, loading, signOut, permissions } = useSupabaseAuth();
  
  // 권한 정보를 user 객체에 병합
  const enrichedUser = session?.user ? {
    ...session.user,
    isAdmin: permissions?.role === 'admin' || 
             ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'].includes(session.user.email),
    canWrite: permissions?.can_write || permissions?.role === 'admin',
    permissions
  } : null;
  
  return {
    user: enrichedUser,
    status: loading ? 'loading' : (session ? 'authenticated' : 'unauthenticated'),
    signIn: () => {
      // Supabase Auth에서는 직접 signIn 페이지로 리다이렉트
      window.location.href = '/auth/signin';
    },
    signOut
  };
}

export { useAuth as useNextAuth };