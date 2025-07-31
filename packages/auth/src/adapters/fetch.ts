'use client'

import type { AuthAdapter, AuthUser, AuthAdapterOptions } from '../types'

export class FetchAdapter implements AuthAdapter {
  private options: AuthAdapterOptions
  private listeners: Set<(user: AuthUser | null) => void> = new Set()
  private currentUser: AuthUser | null = null
  private syncAttempted: boolean = false

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
        credentials: 'include',
        cache: 'no-store' // 캐시 비활성화
      })
      
      if (!response.ok) {
        console.log('[FetchAdapter] Session response not ok:', response.status)
        return null
      }

      const data = await response.json()
      
      // 디버깅 로그 추가
      console.log('[FetchAdapter] Session response:', {
        status: response.status,
        hasUser: !!data.user,
        authenticated: data.authenticated,
        needsSync: data.needsSync,
        userEmail: data.user?.email
      })
      
      // 세션 동기화가 필요한 경우
      if (data.needsSync && data.user && !this.syncAttempted) {
        console.log('[FetchAdapter] Session sync needed, attempting to sync...')
        this.syncAttempted = true
        
        try {
          // 메인 사이트에서 동기화 토큰 요청
          const tokenResponse = await fetch('https://www.bluenote.site/api/auth/session-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
          })
          
          if (tokenResponse.ok) {
            const { syncToken } = await tokenResponse.json()
            console.log('[FetchAdapter] Got sync token, syncing session...')
            
            // Quiz 앱에 세션 동기화
            const syncResponse = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ syncToken }),
            })
            
            if (syncResponse.ok) {
              console.log('[FetchAdapter] Session synced successfully')
              // 동기화 후 다시 세션 확인 (재귀 방지)
              this.syncAttempted = false
              const newResponse = await fetch(`${this.options.apiEndpoint}/session`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                },
                credentials: 'include',
                cache: 'no-store'
              })
              
              if (newResponse.ok) {
                const newData = await newResponse.json()
                if (newData.user && newData.user.email) {
                  const user: AuthUser = {
                    id: newData.user.id || newData.user.email,
                    email: newData.user.email,
                    name: newData.user.name || newData.user.email,
                    image: newData.user.image,
                    isAdmin: newData.user.isAdmin || false,
                    canWrite: newData.user.canWrite || false,
                    claudeDailyLimit: newData.user.claudeDailyLimit || 3,
                    role: newData.user.role || 'user'
                  }
                  
                  this.currentUser = user
                  this.notifyListeners(user)
                  return user
                }
              }
            }
          }
        } catch (error) {
          console.error('[FetchAdapter] Error syncing session:', error)
        }
      }
      
      // authenticated 플래그와 user 객체 둘 다 확인
      if (data.user && data.user.email) {
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
      console.error('[FetchAdapter] Error fetching session:', error)
    }
    
    // 로그아웃 상태라면 리스너들에게 알림
    if (this.currentUser !== null) {
      this.currentUser = null
      this.notifyListeners(null)
    }
    
    return null
  }

  async signIn(provider: string = 'google'): Promise<void> {
    // syncAttempted 리셋
    this.syncAttempted = false
    
    // 메인 사이트의 로그인 페이지로 리다이렉트
    const callbackUrl = encodeURIComponent(window.location.href)
    window.location.href = `https://www.bluenote.site/auth/signin?provider=${provider}&callbackUrl=${callbackUrl}`
  }

  async signOut(): Promise<void> {
    try {
      // Quiz 앱 세션 종료
      await fetch('/api/auth/sync', {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Error clearing Quiz session:', error)
    }
    
    // 메인 사이트의 로그아웃 엔드포인트로 리다이렉트
    window.location.href = 'https://www.bluenote.site/api/auth/signout?callbackUrl=' + encodeURIComponent(this.options.signOutUrl || '/')
  }

  subscribeToChanges(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback)
    
    // 폴링 비활성화 - 무한 루프 방지
    // Quiz 앱은 페이지 로드 시에만 세션 확인
    // 필요시 수동으로 getSession() 호출
    
    // 구독 해제 함수 반환
    return () => {
      this.listeners.delete(callback)
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