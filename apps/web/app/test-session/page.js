'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestSessionPage() {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session-check')
      .then(res => res.json())
      .then(data => {
        setSessionData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Session check error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test Page</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-bold mb-2">Raw Session Data:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>

          {sessionData?.authenticated && (
            <div className="p-4 bg-blue-100 rounded">
              <h2 className="font-bold mb-2">User Info:</h2>
              <p>Email: {sessionData.session?.user?.email}</p>
              <p>Name: {sessionData.session?.user?.name}</p>
              <p>Is Admin: {sessionData.session?.user?.isAdmin ? 'YES' : 'NO'}</p>
            </div>
          )}

          <div className="space-x-4">
            <Link href="/" className="text-blue-600 hover:underline">
              Go to Home
            </Link>
            {sessionData?.session?.user?.isAdmin && (
              <>
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
                  Admin Dashboard
                </Link>
                <Link href="/ai/chat" className="text-blue-600 hover:underline">
                  Claude Chat
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}