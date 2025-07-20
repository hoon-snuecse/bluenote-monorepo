'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug/tokens');
      const result = await response.json();
      setData(result);
    } catch (error) {
      setData({ error: 'Failed to fetch debug info' });
    }
    setLoading(false);
  };

  const clearTokens = async () => {
    try {
      const response = await fetch('/api/auth/google/revoke', {
        method: 'POST'
      });
      if (response.ok) {
        alert('Tokens cleared');
        fetchDebugInfo();
      }
    } catch (error) {
      alert('Failed to clear tokens');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Session Status</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(data?.session || {}, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Google Tokens</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(data?.tokens || {}, null, 2)}
        </pre>
      </div>

      <div className="flex gap-4">
        <button
          onClick={fetchDebugInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
        <button
          onClick={clearTokens}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Tokens
        </button>
        <a
          href="/api/auth/google?assignmentId=test"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 inline-block"
        >
          Test Google Auth
        </a>
      </div>
    </div>
  );
}