'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '../contexts/AuthContext'
import { NextAuthAdapter, useNextAuthSession } from '../adapters/nextauth'
import { useAuth as useAuthContext } from '../contexts/AuthContext'
import type { AuthProviderProps } from '../types'

// NextAuth의 SessionProvider와 통합된 AuthProvider
export function NextAuthProvider({ children, options }: AuthProviderProps) {
  return (
    <SessionProvider>
      <NextAuthBridge options={options}>
        {children}
      </NextAuthBridge>
    </SessionProvider>
  )
}

// NextAuth 세션을 AuthContext와 연결하는 브릿지 컴포넌트
function NextAuthBridge({ children, options }: AuthProviderProps) {
  const { user, status } = useNextAuthSession()
  const [adapter] = React.useState(() => new NextAuthAdapter(options))

  // NextAuth 세션 정보를 AuthContext에 전달
  React.useEffect(() => {
    if (adapter.subscribeToChanges) {
      adapter.subscribeToChanges(() => {})
    }
  }, [adapter])

  return (
    <AuthProvider adapter={adapter} options={options}>
      <SyncNextAuthSession />
      {children}
    </AuthProvider>
  )
}

// NextAuth 세션과 AuthContext를 동기화
function SyncNextAuthSession() {
  const { user: nextAuthUser, status: nextAuthStatus } = useNextAuthSession()
  const authContext = useAuthContext()

  React.useEffect(() => {
    // NextAuth 세션 상태를 AuthContext와 동기화
    // 이미 AuthProvider 내부에서 처리되므로 추가 작업 불필요
  }, [nextAuthUser, nextAuthStatus, authContext])

  return null
}

// NextAuth를 사용하는 앱에서는 이 훅을 사용
export { useAuth } from '../contexts/AuthContext'