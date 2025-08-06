'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useState } from 'react';

export default function SessionDebugPage() {
  const { user, status, signOut } = useAuth();
  const session = user ? { user } : null;
  const [updating, setUpdating] = useState(false);

  const handleRefreshSession = async () => {
    setUpdating(true);
    try {
      // \ud1b5\ud569 \uc778\uc99d\uc5d0\uc11c\ub294 \ud398\uc774\uc9c0 \uc0c8\ub85c\uace0\uce68\uc73c\ub85c \uc138\uc158 \uc5c5\ub370\uc774\ud2b8
      window.location.reload();
    } catch (error) {
      console.error('Session update failed:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOutAndIn = async () => {
    await signOut();
    window.location.href = '/api/auth/signin';
  };

  if (status === 'loading') {
    return <div className="p-8">Loading session...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Session Status: {status}</h2>
        {session ? (
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        ) : (
          <p>No session found</p>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Key Session Properties:</h2>
        {session && (
          <ul className="space-y-1 text-sm">
            <li>Email: {session.user?.email}</li>
            <li>Name: {session.user?.name}</li>
            <li>Is Admin: {session.user?.isAdmin ? 'Yes' : 'No'}</li>
            <li>Can Write: {session.user?.canWrite ? 'Yes' : 'No'}</li>
            <li>Role: {session.user?.role || 'Not set'}</li>
            <li>Claude Daily Limit: {session.user?.claudeDailyLimit || 'Not set'}</li>
          </ul>
        )}
      </div>

      <div className="space-x-4">
        <button
          onClick={handleRefreshSession}
          disabled={updating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {updating ? 'Refreshing...' : 'Refresh Session'}
        </button>

        <button
          onClick={handleSignOutAndIn}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out & Sign In Again
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p>If isAdmin is not showing as true:</p>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>Check Supabase user_permissions table</li>
          <li>Ensure your email has role = &apos;admin&apos;</li>
          <li>Click &quot;Sign Out & Sign In Again&quot; to refresh credentials</li>
          <li>Check browser cookies for next-auth.session-token</li>
        </ol>
      </div>
    </div>
  );
}