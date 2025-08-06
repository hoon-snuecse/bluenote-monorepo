'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@bluenote/supabase-auth/client';

export default function TestCookiesPage() {
  const [mounted, setMounted] = useState(false);
  const [cookieInfo, setCookieInfo] = useState({});
  const supabase = createBrowserClient();

  useEffect(() => {
    setMounted(true);
    
    // Get cookie info
    const info = {
      hostname: window.location.hostname,
      origin: window.location.origin,
      isProduction: window.location.hostname.includes('bluenote.site'),
      expectedDomain: window.location.hostname.includes('bluenote.site') ? '.bluenote.site' : undefined,
      cookies: document.cookie
    };
    
    setCookieInfo(info);
  }, []);

  const testSetCookie = async () => {
    // Test setting a cookie directly
    const testCookieName = 'test-cookie-domain';
    const isProduction = window.location.hostname.includes('bluenote.site');
    const domain = isProduction ? '.bluenote.site' : undefined;
    
    let cookieString = `${testCookieName}=test-value-${Date.now()}; path=/; SameSite=Lax`;
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    if (isProduction) {
      cookieString += '; Secure';
    }
    
    document.cookie = cookieString;
    
    // Refresh cookie info
    setCookieInfo(prev => ({
      ...prev,
      cookies: document.cookie,
      testCookieSet: cookieString
    }));
  };

  const checkSupabaseSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    setCookieInfo(prev => ({
      ...prev,
      supabaseSession: session,
      supabaseError: error
    }));
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    setCookieInfo(prev => ({
      ...prev,
      refreshResult: { data, error }
    }));
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Cookie Domain Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Environment Info:</h2>
          <pre className="text-sm">{JSON.stringify(cookieInfo, null, 2)}</pre>
        </div>

        <div className="flex gap-4">
          <button
            onClick={testSetCookie}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Set Cookie
          </button>
          
          <button
            onClick={checkSupabaseSession}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Check Supabase Session
          </button>
          
          <button
            onClick={refreshSession}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Refresh Session
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h3 className="font-bold mb-2">Debug Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Check if hostname is correctly detected as production</li>
            <li>Verify that domain is set to '.bluenote.site' on production</li>
            <li>Test setting a cookie and check if it appears in browser DevTools</li>
            <li>Check if Supabase session can be retrieved</li>
            <li>Try refreshing the session if it's not working</li>
          </ol>
        </div>
      </div>
    </div>
  );
}