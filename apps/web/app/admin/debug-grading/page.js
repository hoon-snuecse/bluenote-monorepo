'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DebugGradingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [debugData, setDebugData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user.isAdmin) {
    router.push('/');
    return null;
  }

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      // Debug 데이터 가져오기
      const debugUrl = process.env.NODE_ENV === 'production'
        ? 'https://grading.bluenote.site/api/stats/debug'
        : 'http://localhost:3001/api/stats/debug';
        
      const debugRes = await fetch(debugUrl);
      if (debugRes.ok) {
        const data = await debugRes.json();
        setDebugData(data);
      }

      // Stats 데이터도 가져오기
      const statsRes = await fetch('/api/admin/grading-stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStatsData(data);
      }
    } catch (error) {
      console.error('Error fetching debug data:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Grading Debug</h1>
        <Link href="/admin/analytics" className="text-blue-400 hover:text-blue-300">
          Back to Analytics
        </Link>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={fetchDebugData}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Fetch Debug Data
        </button>

        {debugData && (
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Debug Data</h2>
            
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Recent Evaluations</h3>
              <div className="space-y-2">
                {debugData.recentEvaluations?.map((eval) => (
                  <div key={eval.id} className="bg-slate-700 p-3 rounded text-sm">
                    <p className="text-slate-300">ID: {eval.id}</p>
                    <p className="text-white font-medium">evaluatedBy: "{eval.evaluatedBy}"</p>
                    <p className="text-slate-400">Date: {new Date(eval.evaluatedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Unique evaluatedBy Values</h3>
              <div className="space-y-2">
                {debugData.uniqueEvaluatedBy?.map((item, idx) => (
                  <div key={idx} className="bg-slate-700 p-3 rounded">
                    <p className="text-white">"{item.evaluatedBy}" - Count: {item._count._all}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {statsData && (
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Stats API Result</h2>
            <pre className="text-sm text-slate-300 overflow-auto">
              {JSON.stringify(statsData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}