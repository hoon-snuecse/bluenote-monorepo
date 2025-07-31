'use client'

import type { AuthAdapter, AuthUser, AuthAdapterOptions } from '../types'

export class FetchAdapter implements AuthAdapter {
  private options: AuthAdapterOptions
  private listeners: Set<(user: AuthUser | null) => void> = new Set()
  private currentUser: AuthUser | null = null
  private pollingInterval: number | null = null

  constructor(options: AuthAdapterOptions = {}) {
    this.options = {
      apiEndpoint: '/api/auth',
      signInUrl: '/auth/signin',
      signOutUrl: '/',
      ...options
    }
  }

  async getSession(): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${this.options.apiEndpoint}/session`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      // 디버깅 로그 추가
      if (typeof window !== 'undefined') {
        console.log('[FetchAdapter] Session response:', {
          status: response.status,
          hasUser: !!data.user,
          authenticated: data.authenticated,
          userEmail: data.user?.email,
          raw: data
        })
      }
      
      // authenticated 플래그와 user 객체 둘 다 확인
      if (data.authenticated && data.user && data.user.email) {
        const user: AuthUser = {
          id: data.user.id || data.user.email, // fallback to email if no id
          email: data.user.email,
          name: data.user.name || data.user.email,
          image: data.user.image,
          isAdmin: data.user.isAdmin || false,
          canWrite: data.user.canWrite || false,
          claudeDailyLimit: data.user.claudeDailyLimit || 3,
          role: data.user.role || 'user'
        }
        
        // 사용자 정보가 변경되었으면 리스너들에게 알림
        if (JSON.stringify(user) !== JSON.stringify(this.currentUser)) {
          this.currentUser = user
          this.notifyListeners(user)
        }
        
        return user
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
    
    // 로그아웃 상태라면 리스너들에게 알림
    if (this.currentUser !== null) {
      this.currentUser = null
      this.notifyListeners(null)
    }
    
    return null
  }

  async signIn(provider: string = 'google'): Promise<void> {
    // 메인 사이트의 로그인 페이지로 리다이렉트
    const callbackUrl = encodeURIComponent(window.location.href)
    window.location.href = `https://bluenote.site/auth/signin?provider=${provider}&callbackUrl=${callbackUrl}`
  }

  async signOut(): Promise<void> {
    try {
      // 로컬 세션 종료 시도
      await fetch(`${this.options.apiEndpoint}/signout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
    
    // 메인 사이트의 로그아웃 엔드포인트로 리다이렉트
    window.location.href = 'https://bluenote.site/api/auth/signout?callbackUrl=' + encodeURIComponent(this.options.signOutUrl || '/')
  }

  subscribeToChanges(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback)
    
    // 폴링 시작 (30초마다 세션 확인 - 더 긴 주기로 변경)
    if (!this.pollingInterval && typeof window !== 'undefined') {
      this.pollingInterval = window.setInterval(() => {
        // 현재 활성 탭에서만 폴링 실행
        if (!document.hidden) {
          this.getSession().catch(error => {
            console.error('[FetchAdapter] Polling error:', error)
          })
        }
      }, 30000) // 30초로 변경
    }
    
    // 초기 세션 정보는 이미 AuthContext에서 로드하므로 여기서는 생략
    // 중복 호출을 방지하기 위해 callback 호출 제거
    
    // 구독 해제 함수 반환
    return () => {
      this.listeners.delete(callback)
      
      // 더 이상 리스너가 없으면 폴링 중지
      if (this.listeners.size === 0 && this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    }
  }

  private notifyListeners(user: AuthUser | null) {
    this.listeners.forEach(callback => {
      try {
        callback(user)
      } catch (error) {
        console.error('Error in auth listener:', error)
      }
    })
  }
}