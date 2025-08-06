'use client';

import { useState } from 'react';
import { createBrowserClient } from '@bluenote/supabase-auth/client';

export default function OAuthDebugPage() {
  const [oauthUrl, setOauthUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const testOAuth = async () => {
    setLoading(true);
    
    try {
      const currentOrigin = window.location.origin;
      console.log('[OAuthDebug] Current origin:', currentOrigin);
      
      // Test OAuth with various options
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: true
        }
      });
      
      if (error) {
        console.error('[OAuthDebug] Error:', error);
      } else if (data?.url) {
        console.log('[OAuthDebug] OAuth URL generated:', data.url);
        const url = new URL(data.url);
        console.log('[OAuthDebug] OAuth params:', {
          redirect_uri: url.searchParams.get('redirect_uri'),
          client_id: url.searchParams.get('client_id'),
          state: url.searchParams.get('state'),
        });
        setOauthUrl(data.url);
      }
    } catch (err) {
      console.error('[OAuthDebug] Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const redirectManually = () => {
    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Debug Tool</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Current Environment:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
{JSON.stringify({
  origin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
}, null, 2)}
          </pre>
        </div>

        <div>
          <button
            onClick={testOAuth}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Test OAuth URL Generation'}
          </button>
        </div>

        {oauthUrl && (
          <div>
            <h2 className="font-semibold mb-2">Generated OAuth URL:</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-xs break-all mb-4">{oauthUrl}</p>
              <button
                onClick={redirectManually}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Manually Redirect
              </button>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h3 className="font-bold mb-2">Debug Instructions:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Click "Test OAuth URL Generation"</li>
            <li>Check browser console for OAuth URL details</li>
            <li>Verify redirect_uri parameter is correct</li>
            <li>Click "Manually Redirect" to test OAuth flow</li>
          </ol>
        </div>
      </div>
    </div>
  );
}