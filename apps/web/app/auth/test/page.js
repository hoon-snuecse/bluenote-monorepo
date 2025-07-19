'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // Get all cookies from document.cookie
    const allCookies = document.cookie.split(';').map(c => c.trim());
    setCookies(allCookies);

    // Fetch debug info
    fetch('/api/debug/session')
      .then(res => res.json())
      .then(data => setDebugInfo(data))
      .catch(err => console.error('Debug fetch error:', err));
  }, [session]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
        <p>Status: <span className="font-mono">{status}</span></p>
        {session ? (
          <div>
            <p>Logged in as: <span className="font-mono">{session.user?.email}</span></p>
            <p>Admin: <span className="font-mono">{session.user?.isAdmin ? 'Yes' : 'No'}</span></p>
            <p>Can Write: <span className="font-mono">{session.user?.canWrite ? 'Yes' : 'No'}</span></p>
            <button 
              onClick={() => signOut()} 
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => signIn('google')} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In with Google
          </button>
        )}
      </div>

      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Browser Cookies</h2>
        <div className="font-mono text-sm">
          {cookies.length > 0 ? (
            cookies.map((cookie, i) => (
              <div key={i} className="mb-1">
                {cookie.includes('next-auth') || cookie.includes('__Secure') ? (
                  <span className="text-green-600">{cookie}</span>
                ) : (
                  <span className="text-gray-600">{cookie}</span>
                )}
              </div>
            ))
          ) : (
            <p>No cookies found</p>
          )}
        </div>
      </div>

      {debugInfo && (
        <div className="mb-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Server Debug Info</h2>
          <pre className="font-mono text-sm overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}