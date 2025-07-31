'use client'

import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { useAuth } from '@bluenote/auth'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function QuizLayout({ children }) {
  const { user, status } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)
  const pathname = usePathname()
  
  // 커뮤니티 페이지는 인증 없이도 볼 수 있도록 함
  const isPublicPage = pathname === '/community' || pathname.startsWith('/community/')
  
  useEffect(() => {
    // 커뮤니티 페이지가 아니고 인증되지 않은 경우에만 리다이렉트
    if (!isPublicPage && status === 'unauthenticated' && !hasRedirected) {
      setHasRedirected(true)
      console.log('[Quiz Layout] Redirecting to signin...')
      // 메인 사이트 로그인 페이지로 리다이렉트
      const currentPath = window.location.pathname
      window.location.href = `https://www.bluenote.site/login?callbackUrl=${encodeURIComponent(`https://quiz.bluenote.site${currentPath}`)}`
    }
  }, [status, hasRedirected, isPublicPage])
  
  // 로딩 중인 경우
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <TabNavigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }
  
  // 커뮤니티 페이지거나 인증된 경우 콘텐츠 표시
  if (isPublicPage || status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <TabNavigation />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    )
  }
  
  // 인증되지 않은 경우 (리다이렉트 대기 중)
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <TabNavigation />
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">로그인 페이지로 이동 중...</p>
      </div>
    </div>
  )
}