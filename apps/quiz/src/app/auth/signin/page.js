'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/create'
  
  useEffect(() => {
    // 메인 사이트로 리다이렉트하여 로그인 처리
    const mainAuthUrl = process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'https://bluenote.site'
    const encodedCallbackUrl = encodeURIComponent(`https://quiz.bluenote.site${callbackUrl}`)
    window.location.href = `${mainAuthUrl}/api/auth/signin?callbackUrl=${encodedCallbackUrl}`
  }, [callbackUrl])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 pt-28 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Kahoot 퀴즈 메이커
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI와 함께 교육용 퀴즈를 쉽게 만들어보세요
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? '로그인 중...' : 'Google로 계속하기'}
          </button>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-600">
          <p>로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하는 것으로 간주됩니다.</p>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <div className="rounded-md bg-blue-50 p-4 mb-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>💡 개발 환경 안내:</strong><br/>
              로컬 개발 환경에서는 각 앱마다 개별 로그인이 필요합니다.<br/>
              프로덕션 환경(bluenote.site)에서는 한 번의 로그인으로 모든 서비스를 이용할 수 있습니다.
            </p>
          </div>
          <a 
            href={process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'http://localhost:3000'}
            className="block text-center text-gray-600 hover:text-gray-500 text-sm"
          >
            Bluenote 메인 사이트로 이동
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}