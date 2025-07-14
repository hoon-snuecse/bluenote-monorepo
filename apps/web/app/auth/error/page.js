'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages = {
    'AccessDenied': '승인되지 않은 사용자입니다. 관리자에게 문의하세요.',
    'Configuration': '서버 설정에 문제가 있습니다.',
    'Verification': '인증 링크가 만료되었거나 이미 사용되었습니다.',
    'Default': '로그인 중 오류가 발생했습니다.',
  };

  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="quote-sheet max-w-md w-full">
        <div className="relative">
          <div className="absolute inset-4 border border-dashed border-red-200 rounded-lg opacity-30"></div>
          
          <div className="relative z-10 text-center py-12 px-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">
              로그인 오류
            </h1>
            
            <p className="text-slate-600 mb-8">
              {message}
            </p>
            
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                홈으로 돌아가기
              </Link>
              
              {error === 'AccessDenied' && (
                <p className="text-sm text-slate-500 mt-4">
                  접근 권한이 필요하신 경우 
                  <a href="mailto:hoon@snuecse.org" className="text-blue-600 hover:underline ml-1">
                    hoon@snuecse.org
                  </a>
                  로 연락주세요.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">로딩 중...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}