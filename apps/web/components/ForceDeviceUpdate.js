'use client';

import { useNextAuth } from '@bluenote/auth';
import { useState } from 'react';

export function ForceDeviceUpdate() {
  const { user } = useNextAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const forceUpdate = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      // sessionStorage 클리어
      const sessionKey = `device-info-updated-${user.email}`;
      sessionStorage.removeItem(sessionKey);
      
      // API 호출
      const res = await fetch('/api/auth/device-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();
      setResult(data);
      console.log('Force update result:', data);
    } catch (error) {
      console.error('Force update error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-white font-semibold mb-2">디바이스 정보 강제 업데이트</h3>
      <button 
        onClick={forceUpdate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? '업데이트 중...' : '강제 업데이트'}
      </button>
      {result && (
        <div className="mt-2 text-sm">
          {result.success ? (
            <div className="text-green-400">
              성공: {result.device} / {result.browser}
            </div>
          ) : (
            <div className="text-red-400">
              에러: {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}