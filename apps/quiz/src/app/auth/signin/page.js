'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function SignInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/create'
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // 세션 확인
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        if (session && session.user) {
          // 세션이 있으면 원래 가려던 페이지로 이동
          router.push(callbackUrl)
        } else {
          // 세션이 없으면 메인 사이트로 리다이렉트
          const mainAuthUrl = process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'https://bluenote.site'
          const encodedCallbackUrl = encodeURIComponent(`https://quiz.bluenote.site${callbackUrl}`)
          window.location.href = `${mainAuthUrl}/api/auth/signin?callbackUrl=${encodedCallbackUrl}`
        }
      } catch (error) {
        console.error('Session check error:', error)
        setIsChecking(false)
      }
    }
    
    checkSession()
  }, [callbackUrl, router])

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
          <div className="text-center">
            <p className="text-gray-600">
              {isChecking ? '로그인 상태 확인 중...' : '메인 사이트로 이동합니다...'}
            </p>
          </div>
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