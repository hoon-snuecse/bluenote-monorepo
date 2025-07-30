'use client'

import React, { useEffect, useState } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import type { AuthProviderProps, AuthContextValue, AuthUser, AuthStatus } from '../types'

// AuthContext를 직접 정의하여 순환 참조 방지
const NextAuthContext = React.createContext<AuthContextValue | null>(null)

// NextAuth의 SessionProvider와 통합된 AuthProvider
export function NextAuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <NextAuthBridge>
        {children}
      </NextAuthBridge>
    </SessionProvider>
  )
}

// NextAuth 세션을 AuthContext와 연결하는 브릿지 컴포넌트
function NextAuthBridge({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession()
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  
  // NextAuth 세션을 AuthUser 형식으로 변환
  const user: AuthUser | null = session?.user ? {
    id: (session.user as any).id || '',
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    isAdmin: (session.user as any).isAdmin,
    canWrite: (session.user as any).canWrite,
    claudeDailyLimit: (session.user as any).claudeDailyLimit,
    role: (session.user as any).role
  } : null

  // NextAuth 상태를 AuthStatus로 변환
  useEffect(() => {
    if (sessionStatus === 'loading') {
      setAuthStatus('loading')
    } else if (sessionStatus === 'authenticated' && session) {
      setAuthStatus('authenticated')
    } else {
      setAuthStatus('unauthenticated')
    }
  }, [sessionStatus, session])

  const signIn = async (provider: string = 'google') => {
    await nextAuthSignIn(provider, { 
      callbackUrl: window.location.pathname 
    })
  }

  const signOut = async () => {
    await nextAuthSignOut({ 
      callbackUrl: '/'
    })
  }

  const value: AuthContextValue = {
    user,
    status: authStatus,
    signIn,
    signOut
  }

  return (
    <NextAuthContext.Provider value={value}>
      {children}
    </NextAuthContext.Provider>
  )
}

// NextAuth를 사용하는 앱에서는 이 훅을 사용
export function useAuth() {
  const context = React.useContext(NextAuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within a NextAuthProvider')
  }
  
  return context
}