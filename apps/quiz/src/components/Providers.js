'use client'

import { SessionProvider } from 'next-auth/react'
// import { AuthSyncProvider } from './AuthSyncProvider'

export function Providers({ children }) {
  return (
    <SessionProvider>
      {/* AuthSyncProvider 일시 비활성화 - 세션 문제 디버깅 중 */}
      {children}
    </SessionProvider>
  )
}