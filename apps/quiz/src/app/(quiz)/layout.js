'use client'

import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { useAuth } from '@bluenote/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function QuizLayout({ children }) {
  const { user, status } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)
  
  useEffect(() => {
    // 인증되지 않은 경우 한 번만 리다이렉트
    if (status === 'unauthenticated' && !hasRedirected) {
      setHasRedirected(true)
      console.log('[Quiz Layout] Redirecting to signin...')
      // 메인 사이트 로그인 페이지로 리다이렉트, 로그인 후 sync 페이지로 돌아옴
      const currentPath = window.location.pathname
      const syncUrl = `https://quiz.bluenote.site/auth/sync?callbackUrl=${encodeURIComponent(currentPath)}`
      window.location.href = `https://www.bluenote.site/auth/signin?callbackUrl=${encodeURIComponent(syncUrl)}`
    }
  }, [status, hasRedirected])
  
  // 로딩 중인 경우
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }
  
  // 인증되지 않은 경우 (리다이렉트 대기 중)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로그인 페이지로 이동 중...</p>
      </div>
    )
  }
  
  // 인증된 경우
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <TabNavigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}