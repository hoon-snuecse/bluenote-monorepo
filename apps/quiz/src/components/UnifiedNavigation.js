'use client'

import { AppNavigation } from '@bluenote/ui'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function UnifiedNavigation() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  
  // 인증 페이지에서는 네비게이션 숨김
  if (pathname.startsWith('/auth/')) {
    return null
  }
  
  useEffect(() => {
    // 세션 확인
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setUser(data.user)
        }
      })
      .catch(() => setUser(null))
  }, [])
  
  const handleSignOut = () => {
    // 메인 사이트로 리다이렉트하여 로그아웃
    const mainAuthUrl = process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'https://bluenote.site'
    window.location.href = `${mainAuthUrl}/api/auth/signout?callbackUrl=${mainAuthUrl}`
  }
  
  return (
    <>
      <AppNavigation
        currentApp="quiz"
        user={user}
        onSignOut={handleSignOut}
      />
      {/* 네비게이션 높이만큼 여백 추가 */}
      <div className="h-16" />
    </>
  )
}