'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Submissions page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
      <div className="text-center px-4 max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">문제가 발생했습니다</h2>
        <p className="text-lg text-slate-600 mb-6">
          제출 현황을 불러오는 중 오류가 발생했습니다. 불편을 드려 죄송합니다.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}