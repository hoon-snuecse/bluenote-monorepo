'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function DomainChecker() {
  const pathname = usePathname()
  
  useEffect(() => {
    // 프로덕션 환경에서만 동작
    if (process.env.NODE_ENV === 'production') {
      const currentHost = window.location.hostname
      const isQuizDomain = currentHost === 'quiz.bluenote.site'
      const isMainDomain = currentHost === 'bluenote.site' || currentHost === 'www.bluenote.site'
      
      // 메인 도메인에서 Quiz 앱 경로로 접근한 경우 Quiz 도메인으로 리다이렉트
      if (isMainDomain && pathname.startsWith('/')) {
        // 세션 정보가 있을 수 있으므로 전체 URL 유지
        const redirectUrl = `https://quiz.bluenote.site${pathname}${window.location.search}${window.location.hash}`
        console.log('Redirecting from main domain to quiz domain:', redirectUrl)
        window.location.replace(redirectUrl)
      }
    }
  }, [pathname])
  
  return null
}