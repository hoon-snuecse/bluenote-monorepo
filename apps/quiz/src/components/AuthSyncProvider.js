'use client'

import { useEffect } from 'react'
import { useAuthSync } from '@bluenote/auth'
import { useRouter } from 'next/navigation'

export function AuthSyncProvider({ children }) {
  const { isAuthenticated, syncStatus, mainSession } = useAuthSync({
    mainAuthUrl: process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'http://localhost:3000',
    redirectOnFail: false // 수동으로 처리
  })
  const router = useRouter()

  useEffect(() => {
    // 동기화 완료 후 처리
    if (syncStatus === 'synced') {
      // 메인 세션은 있는데 로컬 인증이 없는 경우
      if (mainSession && !isAuthenticated) {
        // Web 앱으로 리다이렉트하여 통합 로그인
        const currentUrl = window.location.href
        window.location.href = `${process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'http://localhost:3000'}/api/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`
      }
    }
  }, [syncStatus, mainSession, isAuthenticated])

  // 동기화 중이거나 실패한 경우 로딩 표시
  if (syncStatus === 'syncing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 정보를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}