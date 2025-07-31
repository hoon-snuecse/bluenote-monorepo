'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSyncPage() {
  const router = useRouter()

  useEffect(() => {
    // 메인 사이트로부터 세션 동기화
    async function syncSession() {
      try {
        // 세션 체크
        const response = await fetch('/api/auth/session', {
          credentials: 'include'
        })
        const data = await response.json()
        
        console.log('[Auth Sync] Session check result:', data)
        
        // URL에서 리다이렉트 경로 가져오기
        const searchParams = new URLSearchParams(window.location.search)
        const redirectTo = searchParams.get('redirect') || '/'
        
        // 세션이 있으면 원래 가려던 페이지로, 없으면 로그인 페이지로
        if (data.authenticated && data.user) {
          router.push(redirectTo)
        } else {
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(redirectTo)}`)
        }
      } catch (error) {
        console.error('[Auth Sync] Error:', error)
        router.push('/auth/signin')
      }
    }

    syncSession()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">인증 확인 중...</p>
      </div>
    </div>
  )
}