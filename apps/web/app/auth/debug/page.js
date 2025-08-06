'use client';

import { useState } from 'react';
import { createBrowserClient } from '@bluenote/supabase-auth/client';

export default function AuthDebugPage() {
  const [result, setResult] = useState(null);
  const supabase = createBrowserClient();

  const testGoogleAuth = async () => {
    console.log('Testing Google OAuth...');
    if (typeof window !== 'undefined') {
      console.log('Origin:', window.location.origin);
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    console.log('OAuth Response:', { data, error });
    setResult({ data, error });
  };

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Current session:', session);
    setResult({ session, error });
  };

  const getSupabaseUrls = () => {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      expectedCallback: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback'
    };
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Environment Info:</h2>
          <pre className="text-sm">{JSON.stringify(getSupabaseUrls(), null, 2)}</pre>
        </div>

        <div className="flex gap-4">
          <button
            onClick={testGoogleAuth}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Google OAuth
          </button>
          
          <button
            onClick={checkSession}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Check Session
          </button>
        </div>

        {result && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold text-yellow-800 mb-2">Google OAuth Setup Instructions:</h3>
          <p className="text-sm text-yellow-700 mb-2">
            Google Cloud Console에 다음 Redirect URI를 추가해야 합니다:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            <li>개발: http://localhost:3000/auth/callback</li>
            <li>프로덕션: https://www.bluenote.site/auth/callback</li>
          </ul>
          <p className="text-sm text-yellow-700 mt-2">
            또는 Supabase의 기본 callback URL을 사용:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            <li>https://ukxchcyvxnbmsfrsamjk.supabase.co/auth/v1/callback</li>
          </ul>
        </div>
      </div>
    </div>
  );
}