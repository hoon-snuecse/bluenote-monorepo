'use client'

import Link from 'next/link'
import { useSupabaseAuth } from '@bluenote/supabase-auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()

  // 로그인된 사용자는 community로 자동 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/community')
    }
  }, [loading, user, router])

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
          {!loading && user ? (
            <>
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
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  퀴즈 메이커를 사용하려면 먼저 로그인이 필요합니다.
                </p>
              </div>
              
              <Link
                href="/auth/signin"
                className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Google로 로그인하기
              </Link>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Google 계정으로 빠르고 안전하게 로그인하세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}