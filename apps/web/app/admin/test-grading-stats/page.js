'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TestGradingStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user.isAdmin) {
    router.push('/');
    return null;
  }

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/grading-stats');
      const data = await res.json();
      
      if (!res.ok) {
        setError(`API Error: ${res.status}`);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching grading stats:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const fetchDirectStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // 직접 grading 앱에 요청 (CORS 문제 발생 가능)
      const url = 'https://grading.bluenote.site/api/stats';
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        setError(`Direct API Error: ${res.status}`);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching direct grading stats:', error);
      setError(`Direct fetch error: ${error.message}`);
    }
    setLoading(false);
  };

  const addTestData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = process.env.NODE_ENV === 'production'
        ? 'https://grading.bluenote.site/api/test/add-evaluations'
        : 'http://localhost:3001/api/test/add-evaluations';
        
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(`Add test data error: ${res.status}`);
      } else {
        alert('Test data added successfully!');
        // 다시 통계 가져오기
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding test data:', error);
      setError(`Add test data error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Grading Stats Test</h1>
        <Link href="/admin/analytics" className="text-blue-400 hover:text-blue-300">
          Back to Analytics
        </Link>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Fetch Stats (via API)
          </button>
          <button
            onClick={fetchDirectStats}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Fetch Stats (Direct)
          </button>
          <button
            onClick={addTestData}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Add Test Data (Grading)
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 p-4 rounded">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {stats && (
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Stats Result</h2>
            <pre className="text-sm text-slate-300 overflow-auto">
              {JSON.stringify(stats, null, 2)}
            </pre>
            
            {stats.evaluations?.byModel && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-slate-700 p-4 rounded">
                  <h3 className="text-white font-medium mb-2">Sonnet</h3>
                  <p className="text-slate-300">
                    Today: {stats.evaluations.byModel.sonnet?.today || 0}
                  </p>
                  <p className="text-slate-300">
                    Total: {stats.evaluations.byModel.sonnet?.total || 0}
                  </p>
                </div>
                <div className="bg-slate-700 p-4 rounded">
                  <h3 className="text-white font-medium mb-2">Opus</h3>
                  <p className="text-slate-300">
                    Today: {stats.evaluations.byModel.opus?.today || 0}
                  </p>
                  <p className="text-slate-300">
                    Total: {stats.evaluations.byModel.opus?.total || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}