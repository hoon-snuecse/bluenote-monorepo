'use client'

import { SessionProvider } from '@bluenote/auth'

export function Providers({ children }) {
  // @bluenote/auth의 SessionProvider 사용하여 Web 앱과 세션 공유
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}