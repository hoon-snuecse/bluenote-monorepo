'use client'

import { useAuth } from '@bluenote/auth'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function QuizLayout({ children }) {
  const { user, status } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)
  const pathname = usePathname()
  
  useEffect(() => {
    console.log('[Quiz Layout] Current status:', status, 'pathname:', pathname, 'hasRedirected:', hasRedirected)
    
    // 인증되지 않은 경우 리다이렉트
    if (status === 'unauthenticated' && !hasRedirected) {
      setHasRedirected(true)
      const currentPath = window.location.pathname
      const redirectUrl = `https://www.bluenote.site/auth/signin?callbackUrl=${encodeURIComponent(`https://quiz.bluenote.site${currentPath}`)}`
      console.log('[Quiz Layout] Redirecting to:', redirectUrl)
      window.location.href = redirectUrl
    }
  }, [status, hasRedirected, pathname])
  
  // 로딩 중인 경우
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }
  
  // 인증된 경우 콘텐츠 표시
  if (status === 'authenticated') {
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