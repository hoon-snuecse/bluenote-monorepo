'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }) {
  // NextAuth SessionProvider를 직접 사용
  // refetchInterval을 짧게 설정하여 세션 동기화 개선
  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  )
}