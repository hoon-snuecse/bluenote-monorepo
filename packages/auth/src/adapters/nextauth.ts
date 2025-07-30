'use client'

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react'
import type { AuthAdapter, AuthUser, AuthAdapterOptions } from '../types'

export class NextAuthAdapter implements AuthAdapter {
  private options: AuthAdapterOptions

  constructor(options: AuthAdapterOptions = {}) {
    this.options = {
      signInUrl: '/auth/signin',
      signOutUrl: '/',
      ...options
    }
  }

  async getSession(): Promise<AuthUser | null> {
    // 서버 사이드에서는 사용할 수 없으므로 null 반환
    if (typeof window === 'undefined') {
      return null
    }

    // 클라이언트 사이드에서는 useSession 훅을 직접 사용해야 함
    // 이 메서드는 초기 로드 시에만 사용됨
    try {
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      if (session?.user) {
        return {
          id: session.user.id || '',
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          isAdmin: session.user.isAdmin,
          canWrite: session.user.canWrite,
          claudeDailyLimit: session.user.claudeDailyLimit,
          role: session.user.role
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
    
    return null
  }

  async signIn(provider: string = 'google'): Promise<void> {
    await nextAuthSignIn(provider, { 
      callbackUrl: window.location.pathname 
    })
  }

  async signOut(): Promise<void> {
    await nextAuthSignOut({ 
      callbackUrl: this.options.signOutUrl 
    })
  }

  // NextAuth는 SessionProvider를 통해 자동으로 변경사항을 추적함
  subscribeToChanges?(callback: (user: AuthUser | null) => void): () => void {
    // NextAuth의 경우 SessionProvider 내부에서 처리됨
    return () => {}
  }
}

// useSession 훅을 사용하여 실시간 세션 정보를 가져오는 헬퍼 함수
export function useNextAuthSession() {
  const { data: session, status } = useSession()
  
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

  return { user, status }
}