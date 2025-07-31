'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import type { AuthWrapperProps } from '../types'

export function AuthWrapper({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/signin',
  fallback = (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">로딩 중...</p>
    </div>
  )
}: AuthWrapperProps) {
  const { user, status } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 리다이렉트는 상태가 확실히 'unauthenticated'일 때만 수행
    // 지연을 두어 초기 로딩 중 리다이렉트 방지
    if (requireAuth && status === 'unauthenticated') {
      const timeoutId = setTimeout(() => {
        const callbackUrl = encodeURIComponent(pathname)
        router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
      }, 100) // 100ms 지연
      
      return () => clearTimeout(timeoutId)
    }
  }, [requireAuth, status, router, pathname, redirectTo])

  // 인증이 필요하지 않은 경우 바로 렌더링
  if (!requireAuth) {
    return <>{children}</>
  }

  // 로딩 중
  if (status === 'loading') {
    return <>{fallback}</>
  }

  // 인증됨
  if (status === 'authenticated' && user) {
    return <>{children}</>
  }

  // 인증되지 않음 (리다이렉트 중)
  return <>{fallback}</>
}