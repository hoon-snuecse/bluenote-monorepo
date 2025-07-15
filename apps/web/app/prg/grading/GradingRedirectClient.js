'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function GradingRedirectClient() {
  const { data: session } = useSession();

  useEffect(() => {
    // 세션 정보를 쿠키로 전달하면서 리다이렉트
    if (session) {
      // grading 앱 페이지로 이동
      window.location.href = 'https://grading.bluenote.site/assignments';
    }
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          글쓰기 평가 시스템으로 이동 중...
        </h2>
        <p className="text-slate-600">
          {session ? '인증 정보를 확인했습니다.' : '로그인 정보를 확인 중입니다.'}
        </p>
      </div>
    </div>
  );
}