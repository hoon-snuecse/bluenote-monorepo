'use client'

import { useAuth } from '@bluenote/auth'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function QuizLayout({ children }) {
  const { user, status } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)
  const pathname = usePathname()
  
  // 커뮤니티 페이지와 홈페이지는 인증 없이도 접근 가능
  const isPublicPage = pathname.startsWith('/community') || pathname === '/'
  
  useEffect(() => {
    console.log('[Quiz Layout] Current status:', status, 'pathname:', pathname, 'hasRedirected:', hasRedirected)
    
    // 공개 페이지가 아니고 인증되지 않은 경우에만 리다이렉트
    if (status === 'unauthenticated' && !hasRedirected && !isPublicPage) {
      setHasRedirected(true)
      const currentPath = window.location.pathname
      const isProduction = process.env.NODE_ENV === 'production'
      const mainSiteUrl = isProduction ? 'https://www.bluenote.site' : 'http://localhost:3000'
      const quizSiteUrl = isProduction ? 'https://quiz.bluenote.site' : 'http://localhost:3003'
      const redirectUrl = `${mainSiteUrl}/auth/signin?callbackUrl=${encodeURIComponent(`${quizSiteUrl}${currentPath}`)}`
      console.log('[Quiz Layout] Redirecting to:', redirectUrl)
      window.location.href = redirectUrl
    }
  }, [status, hasRedirected, pathname, isPublicPage])
  
  // 로딩 중인 경우
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }
  
  // 공개 페이지이거나 인증된 경우 콘텐츠 표시
  if (isPublicPage || status === 'authenticated') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    )
  }
  
  // 인증되지 않은 경우 (리다이렉트 대기 중)
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-600">로그인 페이지로 이동 중...</p>
    </div>
  )
}