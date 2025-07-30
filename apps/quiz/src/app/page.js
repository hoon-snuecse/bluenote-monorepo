'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@bluenote/auth'

export default function HomePage() {
  const router = useRouter()
  const { user, status } = useAuth()

  useEffect(() => {
    // 세션 확인 후 리다이렉트
    if (status === 'authenticated' && user) {
      router.push('/create')
    }
  }, [router, user, status])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900">
            Kahoot 퀴즈 메이커
          </h1>
          <p className="mt-2 text-center text-lg text-gray-600">
            AI와 함께 교육용 퀴즈를 쉽게 만들어보세요
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/create"
            className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            퀴즈 만들기
          </Link>
          
          <Link
            href="/community"
            className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            커뮤니티 퀴즈 둘러보기
          </Link>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-600">
          <p>로그인이 필요한 기능은 자동으로 로그인 페이지로 이동합니다.</p>
        </div>
      </div>
    </div>
  )
}