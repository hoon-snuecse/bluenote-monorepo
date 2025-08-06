'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { createBrowserClient } from '@bluenote/supabase-auth/client';

export default function ClientDebugPage() {
  const { user, status } = useAuth();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkSession = async () => {
      // Direct Supabase session check
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      setSessionInfo({
        directSession: session,
        directUser: currentUser,
        authHookUser: user,
        authHookStatus: status,
        error: error?.message,
        cookies: document.cookie,
        supabaseCookies: document.cookie.split(';').filter(c => c.includes('sb-'))
      });
      
      setLoading(false);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      checkSession();
    });

    return () => subscription.unsubscribe();
  }, [user, status, supabase]);

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
          <h2 className="font-bold mb-2">Supabase Cookies:</h2>
          <pre className="text-sm overflow-auto">
{JSON.stringify(sessionInfo?.supabaseCookies, null, 2)}
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