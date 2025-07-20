'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmissionDetailRedirect({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // 이 페이지는 더 이상 사용되지 않으므로 홈으로 리다이렉트
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600">페이지를 이동 중입니다...</p>
      </div>
    </div>
  );
}