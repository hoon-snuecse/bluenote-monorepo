'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function DebugAnalyticsPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!user || !user.isAdmin) {
      router.push('/');
      return;
    }

    fetchData();
  }, [user, status, router]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/analytics-fixed');
      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Analytics Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">API Response:</h2>
          {error ? (
            <div className="text-red-400">Error: {error}</div>
          ) : (
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          )}
        </div>

        {apiData?.stats && (
          <div className="bg-slate-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Key Stats:</h2>
            <ul className="space-y-1">
              <li>Total Users: {apiData.stats.totalUsers}</li>
              <li>User Activity Length: {apiData.stats.userActivity?.length || 0}</li>
              <li>Total Logins: {apiData.stats.totalLogins}</li>
              <li>Today Logins: {apiData.stats.todayLogins}</li>
            </ul>
          </div>
        )}

        <button
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}