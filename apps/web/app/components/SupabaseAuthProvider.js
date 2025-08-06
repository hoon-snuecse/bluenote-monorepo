'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@bluenote/supabase-auth/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    return { data: null, status: 'loading' };
  }
  return context;
}

export function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    // 초기 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setStatus(session ? 'authenticated' : 'unauthenticated');
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // NextAuth 호환성을 위한 형식
  const value = {
    data: session ? {
      user: {
        email: session.user.email,
        id: session.user.id,
        ...session.user.user_metadata
      },
      expires: new Date(session.expires_at * 1000).toISOString()
    } : null,
    status
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// NextAuth signOut 호환성
export async function signOut() {
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
  window.location.href = '/';
}