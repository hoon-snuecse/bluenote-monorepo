'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function GradingRedirectClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // 세션 로딩이 완료되었을 때
    if (status === 'loading') return;
    
    // 세션이 있으면 바로 리다이렉트
    if (status === 'authenticated' && session && !redirecting) {
      setRedirecting(true);
      window.location.href = 'https://grading.bluenote.site/assignments';
    }
    
    // 세션이 없으면 로그인 페이지로
    if (status === 'unauthenticated' && !redirecting) {
      setRedirecting(true);
      // 로그인 후 grading 시스템으로 바로 이동하도록 callbackUrl 설정
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('https://grading.bluenote.site/assignments'));
    }
  }, [session, status, router, redirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          글쓰기 평가 시스템으로 이동 중...
        </h2>
        <p className="text-slate-600">
          {status === 'loading' && '로그인 정보를 확인 중입니다...'}
          {status === 'authenticated' && '인증 정보를 확인했습니다. 잠시만 기다려주세요...'}
          {status === 'unauthenticated' && '로그인 페이지로 이동합니다...'}
        </p>
      </div>
    </div>
  );
}