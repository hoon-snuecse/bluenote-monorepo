'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }) {
  // Quiz 앱도 SessionProvider가 필요함 (메인 사이트와 동일한 세션 사용)
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}