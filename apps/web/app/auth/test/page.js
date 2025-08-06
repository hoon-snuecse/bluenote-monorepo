'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [cookies, setCookies] = useState('');
  const [supabaseTest, setSupabaseTest] = useState('Loading...');

  useEffect(() => {
    // 1. Check cookies
    setCookies(document.cookie);

    // 2. Test Supabase
    const testSupabase = async () => {
      try {
        const { createBrowserClient } = await import('@bluenote/supabase-auth/client');
        const supabase = createBrowserClient();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setSupabaseTest({
          hasSession: !!session,
          sessionEmail: session?.user?.email,
          error: error?.message,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (err) {
        setSupabaseTest({
          error: err.message
        });
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Basic Test Page</h1>
      
      <div className="mb-4">
        <h2 className="font-bold mb-2">Cookies:</h2>
        <div className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {cookies.split(';').map((c, i) => (
            <div key={i} className={c.includes('sb-') ? 'text-blue-600 font-bold' : ''}>
              {c.trim()}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-bold mb-2">Supabase Test:</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify(supabaseTest, null, 2)}
        </pre>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go Home
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