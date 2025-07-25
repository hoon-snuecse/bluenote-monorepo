'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TestLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user.isAdmin) {
    router.push('/');
    return null;
  }

  const checkLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/check-logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Error checking logs:', error);
    }
    setLoading(false);
  };

  const addManualLog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manual-login-log', {
        method: 'POST'
      });
      const data = await res.json();
      alert(data.success ? 'Login log added!' : `Error: ${data.error}`);
      checkLogs();
    } catch (error) {
      console.error('Error adding manual log:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Login Logs Test</h1>
        <Link href="/admin/analytics" className="text-blue-400 hover:text-blue-300">
          Back to Analytics
        </Link>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={checkLogs}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Check Logs
          </button>
          <button
            onClick={addManualLog}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Add Manual Login Log
          </button>
        </div>

        {logs && (
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Log Results</h2>
            
            <div className="mb-4">
              <p className="text-slate-400">Login logs count: {logs.loginCount}</p>
              <p className="text-slate-400">Action types found: {logs.allActionTypes.join(', ') || 'none'}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Recent Login Logs:</h3>
              {logs.loginLogs.length > 0 ? (
                logs.loginLogs.map((log, i) => (
                  <div key={i} className="bg-slate-700 p-3 rounded">
                    <p className="text-white">{log.user_email}</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No login logs found</p>
              )}
            </div>

            {(logs.errors.login || logs.errors.types) && (
              <div className="mt-4 bg-red-900/20 p-3 rounded">
                <p className="text-red-400">Errors:</p>
                {logs.errors.login && <p className="text-red-300 text-sm">Login: {logs.errors.login}</p>}
                {logs.errors.types && <p className="text-red-300 text-sm">Types: {logs.errors.types}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}