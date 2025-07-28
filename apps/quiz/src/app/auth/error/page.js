'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessages = {
    Configuration: '서버 설정 오류가 발생했습니다. 환경 변수를 확인해주세요.',
    AccessDenied: '접근이 거부되었습니다.',
    Verification: '인증 링크가 만료되었거나 이미 사용되었습니다.',
    OAuthSignin: 'OAuth 로그인을 시작하는 중 오류가 발생했습니다.',
    OAuthCallback: 'OAuth 인증 과정에서 오류가 발생했습니다.',
    OAuthCreateAccount: 'OAuth 계정 생성 중 오류가 발생했습니다.',
    EmailCreateAccount: '이메일 계정 생성 중 오류가 발생했습니다.',
    Callback: '인증 콜백 처리 중 오류가 발생했습니다.',
    OAuthAccountNotLinked: '이미 다른 계정과 연결된 이메일입니다.',
    EmailSignin: '이메일 로그인 중 오류가 발생했습니다.',
    CredentialsSignin: '자격 증명 확인 중 오류가 발생했습니다.',
    Default: '로그인 중 오류가 발생했습니다.',
  }
  
  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 pt-28 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            로그인 오류
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>
        
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            다시 로그인하기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}