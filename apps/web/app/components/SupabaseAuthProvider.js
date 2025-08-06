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
    // 권한 정보를 포함한 세션 가져오기
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 권한 정보 가져오기
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('role, can_write, claude_daily_limit')
          .eq('email', session.user.email)
          .single();
        
        // 세션에 권한 정보 추가
        const enrichedSession = {
          ...session,
          user: {
            ...session.user,
            isAdmin: permissions?.role === 'admin',
            canWrite: permissions?.can_write || false,
            permissions
          }
        };
        
        setSession(enrichedSession);
        setStatus('authenticated');
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
    };
    
    loadSession();

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // 권한 정보 가져오기
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('role, can_write, claude_daily_limit')
          .eq('email', session.user.email)
          .single();
        
        // 세션에 권한 정보 추가
        const enrichedSession = {
          ...session,
          user: {
            ...session.user,
            isAdmin: permissions?.role === 'admin',
            canWrite: permissions?.can_write || false,
            permissions
          }
        };
        
        setSession(enrichedSession);
        setStatus('authenticated');
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
      
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