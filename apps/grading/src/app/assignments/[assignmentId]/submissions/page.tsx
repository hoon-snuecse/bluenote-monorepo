'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // 대시보드로 리다이렉트
    router.replace(`/assignments/${params.assignmentId}/dashboard`);
  }, [params.assignmentId, router]);

  // 리다이렉트 중 표시
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">평가 대시보드로 이동 중...</p>
      </div>
    </div>
  );
}