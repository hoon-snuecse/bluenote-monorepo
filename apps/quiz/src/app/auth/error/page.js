'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessages = {
    Configuration: '서버 설정 오류가 발생했습니다.',
    AccessDenied: '접근이 거부되었습니다.',
    Verification: '인증 링크가 만료되었거나 이미 사용되었습니다.',
    Default: '로그인 중 오류가 발생했습니다.',
  }
  
  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
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