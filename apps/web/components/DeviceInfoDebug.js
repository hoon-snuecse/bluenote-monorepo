'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export function DeviceInfoDebug() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const checkSessionStorage = () => {
    if (!session?.user?.email) return null;
    const key = `device-info-updated-${session.user.email}`;
    return sessionStorage.getItem(key);
  };
  
  const clearSessionStorage = () => {
    if (!session?.user?.email) return;
    const key = `device-info-updated-${session.user.email}`;
    sessionStorage.removeItem(key);
    alert('SessionStorage cleared. Device info will update on next page load.');
  };
  
  const forceUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/device-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  if (!session) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-sm max-w-sm">
      <h3 className="font-bold mb-2">Device Info Debug</h3>
      <div className="space-y-2">
        <p>User: {session.user.email}</p>
        <p>SessionStorage: {checkSessionStorage() ? 'Set' : 'Not set'}</p>
        
        <div className="flex gap-2">
          <button
            onClick={clearSessionStorage}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Clear Storage
          </button>
          <button
            onClick={forceUpdate}
            disabled={loading}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Force Update'}
          </button>
        </div>
        
        {response && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}