'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { createBrowserClient } from '@bluenote/supabase-auth/client';

export default function ClientDebugPage() {
  const authData = useAuth();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createBrowserClient());

  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        // Direct Supabase session check
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        // Parse cookies to check for auth tokens
        const cookies = document.cookie.split(';').map(c => c.trim());
        const authTokenCookie = cookies.find(c => c.startsWith('sb-ukxchcyvxnbmsfrsamjk-auth-token'));
        const authTokenChunked = cookies.filter(c => c.includes('sb-ukxchcyvxnbmsfrsamjk-auth-token.'));
        
        // 청크된 쿠키 재조합 테스트
        let reconstructedToken = null;
        if (authTokenChunked.length > 0) {
          const chunks = [];
          for (let i = 0; i < authTokenChunked.length; i++) {
            const chunk = cookies.find(c => c.startsWith(`sb-ukxchcyvxnbmsfrsamjk-auth-token.${i}=`));
            if (chunk) {
              chunks.push(chunk.split('=')[1]);
            }
          }
          reconstructedToken = chunks.join('');
        }
        
        if (isMounted) {
          setSessionInfo({
            directSession: session,
            directUser: currentUser,
            authHookUser: authData?.user,
            authHookStatus: authData?.status,
            sessionError: error?.message,
            userError: userError?.message,
            cookies: document.cookie,
            supabaseCookies: cookies.filter(c => c.includes('sb-')),
            authTokenCookie: authTokenCookie,
            authTokenChunked: authTokenChunked,
            reconstructedToken: reconstructedToken,
            hasAuthToken: !!authTokenCookie || authTokenChunked.length > 0,
            timestamp: new Date().toISOString()
          });
          
          console.log('[ClientDebug] Session check completed:', {
            hasDirectSession: !!session,
            hasDirectUser: !!currentUser,
            hasAuthHookUser: !!authData?.user,
            authHookStatus: authData?.status,
            hasAuthToken: !!authTokenCookie || authTokenChunked.length > 0
          });
        }
      } catch (error) {
        console.error('[ClientDebug] Error checking session:', error);
        if (isMounted) {
          setSessionInfo({
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial check
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        console.log('[ClientDebug] Auth state change:', event, session ? 'Session exists' : 'No session');
        checkSession();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // 의존성 배열에서 user, status, supabase 제거하여 무한 루프 방지

  const forceRefresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.refreshSession();
    console.log('Force refresh result:', { data, error });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Client-Side Auth Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Hook Status:</h2>
          <pre className="text-sm overflow-auto">
{JSON.stringify({
  user: sessionInfo?.authHookUser,
  status: sessionInfo?.authHookStatus
}, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Direct Supabase Session:</h2>
          <pre className="text-sm overflow-auto">
{JSON.stringify({
  session: sessionInfo?.directSession,
  user: sessionInfo?.directUser,
  error: sessionInfo?.error
}, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Cookie Analysis:</h2>
          <pre className="text-sm overflow-auto">
{JSON.stringify({
  hasAuthToken: sessionInfo?.hasAuthToken,
  authTokenCookie: sessionInfo?.authTokenCookie,
  authTokenChunked: sessionInfo?.authTokenChunked,
  reconstructedToken: sessionInfo?.reconstructedToken ? 
    `${sessionInfo.reconstructedToken.substring(0, 50)}...` : null,
  allSupabaseCookies: sessionInfo?.supabaseCookies
}, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Errors:</h2>
          <pre className="text-sm overflow-auto">
{JSON.stringify({
  sessionError: sessionInfo?.sessionError,
  userError: sessionInfo?.userError,
  generalError: sessionInfo?.error
}, null, 2)}
          </pre>
        </div>

        <div className="flex gap-4">
          <button
            onClick={forceRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Force Refresh Session
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reload Page
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h3 className="font-bold mb-2">Debug Notes:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>If directSession exists but authHookUser is null, the auth provider isn't receiving the session</li>
            <li>If both are null but cookies exist, there might be a cookie reading issue</li>
            <li>Check if permissions are loaded correctly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}