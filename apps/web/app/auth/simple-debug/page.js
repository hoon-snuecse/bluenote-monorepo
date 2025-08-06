'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@bluenote/supabase-auth/client';

export default function SimpleDebugPage() {
  const [info, setInfo] = useState({ loading: true });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient();
        
        // 1. Check cookies
        const cookies = document.cookie;
        const hasCookies = cookies.includes('sb-ukxchcyvxnbmsfrsamjk-auth-token');
        
        // 2. Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // 3. Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        setInfo({
          loading: false,
          cookies: hasCookies ? 'Found auth cookies' : 'No auth cookies',
          cookiesList: cookies.split(';').filter(c => c.includes('sb-')).map(c => c.trim()),
          session: session ? 'Session exists' : 'No session',
          sessionEmail: session?.user?.email,
          user: user ? 'User exists' : 'No user',
          userEmail: user?.email,
          sessionError: sessionError?.message,
          userError: userError?.message,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (err) {
        setInfo({
          loading: false,
          error: err.message
        });
      }
    };

    checkAuth();
    
    // Refresh every 2 seconds
    const interval = setInterval(checkAuth, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (info.loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Auth Debug</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
{JSON.stringify(info, null, 2)}
      </pre>
      
      <div className="mt-4">
        <button 
          onClick={() => window.location.href = '/auth/signin'}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
        >
          Go to Sign In
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Reload
        </button>
      </div>
    </div>
  );
}