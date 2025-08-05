'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/create'
  
  useEffect(() => {
    // Web 앱의 로그인 페이지로 리다이렉트
    // 개발/프로덕션 환경에 따라 URL 설정
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.bluenote.site'
      : 'http://localhost:3000'
    
    const quizUrl = process.env.NODE_ENV === 'production'
      ? 'https://quiz.bluenote.site'
      : 'http://localhost:3003'
      
    const redirectUrl = `${baseUrl}/auth/signin?callbackUrl=${encodeURIComponent(`${quizUrl}${callbackUrl}`)}`
    window.location.href = redirectUrl
  }, [callbackUrl])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-md">
              K
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kahoot 퀴즈 메이커
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            잠시만 기다려주세요. 로그인 페이지로 이동 중입니다...
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}