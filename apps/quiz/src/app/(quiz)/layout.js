'use client'

import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { AuthWrapper, useAuth } from '@bluenote/auth'
import { useEffect } from 'react'

// 디버깅을 위한 세션 체크 컴포넌트
function SessionDebug() {
  const { user, status } = useAuth()
  
  useEffect(() => {
    console.log('[Quiz Layout] Auth status:', status)
    console.log('[Quiz Layout] User:', user)
    
    // 처음 마운트 시 세션 체크 강제 실행
    if (status === 'loading') {
      fetch('/api/auth/session', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          console.log('[Quiz Layout] Manual session check:', data)
        })
        .catch(err => {
          console.error('[Quiz Layout] Session check error:', err)
        })
    }
  }, [status])
  
  return null
}

export default function QuizLayout({ children }) {
  return (
    <AuthWrapper 
      requireAuth={true}
      redirectTo="/auth/signin"
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      }
    >
      <SessionDebug />
      <div className="min-h-screen bg-gray-50 pt-16">
        <TabNavigation />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AuthWrapper>
  )
}