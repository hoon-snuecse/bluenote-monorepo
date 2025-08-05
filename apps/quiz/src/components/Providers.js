'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }) {
  // NextAuth SessionProvider를 직접 사용
  // refetchInterval을 짧게 설정하여 세션 동기화 개선
  // basePath를 설정하여 Quiz 앱의 auth 경로 사용
  return (
    <SessionProvider 
      refetchInterval={60} 
      refetchOnWindowFocus={true}
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  )
}