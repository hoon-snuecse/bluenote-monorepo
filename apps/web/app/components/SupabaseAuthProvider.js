'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  const [supabase] = useState(() => createBrowserClient());
  const router = useRouter();

  // 세션과 권한 정보를 로드하는 함수
  const loadSessionWithPermissions = useCallback(async (currentSession) => {
    if (!currentSession) {
      console.log('[SupabaseAuthProvider] No session to enrich');
      setSession(null);
      setStatus('unauthenticated');
      return;
    }

    try {
      console.log('[SupabaseAuthProvider] Loading permissions for:', currentSession.user.email);
      
      // 권한 정보 가져오기
      const { data: permissions, error: permError } = await supabase
        .from('user_permissions')
        .select('role, can_write, claude_daily_limit')
        .eq('email', currentSession.user.email)
        .single();
      
      if (permError) {
        console.error('[SupabaseAuthProvider] Error fetching permissions:', permError);
      }
      
      // 세션에 권한 정보 추가
      const enrichedSession = {
        ...currentSession,
        user: {
          ...currentSession.user,
          isAdmin: permissions?.role === 'admin',
          canWrite: permissions?.can_write || false,
          permissions
        }
      };
      
      console.log('[SupabaseAuthProvider] Session enriched:', {
        email: enrichedSession.user.email,
        isAdmin: enrichedSession.user.isAdmin,
        canWrite: enrichedSession.user.canWrite
      });
      
      setSession(enrichedSession);
      setStatus('authenticated');
    } catch (error) {
      console.error('[SupabaseAuthProvider] Error in loadSessionWithPermissions:', error);
      setStatus('unauthenticated');
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    // 초기 세션 로드
    const loadInitialSession = async () => {
      try {
        console.log('[SupabaseAuthProvider] Loading initial session...');
        
        // getSession은 쿠키에서 세션을 읽음
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[SupabaseAuthProvider] Error getting session:', error);
          if (mounted) {
            setStatus('unauthenticated');
          }
          return;
        }
        
        console.log('[SupabaseAuthProvider] Initial session loaded:', currentSession ? 'Found' : 'Not found');
        
        if (mounted && currentSession) {
          await loadSessionWithPermissions(currentSession);
        } else if (mounted) {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('[SupabaseAuthProvider] Error in loadInitialSession:', error);
        if (mounted) {
          setStatus('unauthenticated');
        }
      }
    };
    
    loadInitialSession();

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[SupabaseAuthProvider] Auth state changed:', event, newSession ? 'Session found' : 'No session');
      
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession) {
          await loadSessionWithPermissions(newSession);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setStatus('unauthenticated');
      }
      
      // 초기 로드 시에도 세션 체크
      if (event === 'INITIAL_SESSION' && newSession) {
        await loadSessionWithPermissions(newSession);
      }
      
      router.refresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, loadSessionWithPermissions]);

  // NextAuth 호환성을 위한 형식
  const value = {
    data: session ? {
      user: {
        email: session.user.email,
        id: session.user.id,
        isAdmin: session.user.isAdmin,
        canWrite: session.user.canWrite,
        permissions: session.user.permissions,
        ...session.user.user_metadata
      },
      expires: new Date(session.expires_at * 1000).toISOString()
    } : null,
    status,
    update: async () => {
      // Refresh session
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      if (newSession) {
        await loadSessionWithPermissions(newSession);
      }
    }
  };
  
  // 디버그 로깅은 useEffect에서만 수행
  useEffect(() => {
    if (typeof window !== 'undefined' && (status === 'authenticated' || status === 'unauthenticated')) {
      console.log('[SupabaseAuthProvider] Auth state updated:', {
        status,
        hasSession: !!session,
        userEmail: session?.user?.email,
        isAdmin: session?.user?.isAdmin,
        canWrite: session?.user?.canWrite
      });
    }
  }, [status, session]);

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