'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from './client'

const SupabaseAuthContext = createContext({})

export function SupabaseAuthProvider({ children, redirectTo = '/' }) {
  const supabase = createBrowserClient()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState(null)
  const router = useRouter()

  // 권한 정보 로드 함수 - API를 통해 가져오기
  const loadPermissions = async (userEmail) => {
    if (!userEmail) {
      setPermissions(null)
      return null
    }
    
    try {
      console.log('[SupabaseAuthProvider] Loading permissions for:', userEmail)
      
      // API를 통해 권한 정보 가져오기 (RLS 우회)
      try {
        const response = await fetch('/api/auth/permissions')
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user?.permissions) {
            console.log('[SupabaseAuthProvider] Permissions loaded from API:', data.user.permissions)
            setPermissions(data.user.permissions)
            return data.user.permissions
          }
        }
      } catch (apiError) {
        console.error('[SupabaseAuthProvider] API permissions fetch failed:', apiError)
      }
      
      // API 실패 시 폴백 - session-check 시도
      try {
        const response = await fetch('/api/auth/session-check')
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user?.permissions) {
            console.log('[SupabaseAuthProvider] Permissions loaded from session-check:', data.user.permissions)
            setPermissions(data.user.permissions)
            return data.user.permissions
          }
        }
      } catch (apiError) {
        console.error('[SupabaseAuthProvider] Session-check fallback failed:', apiError)
      }
      
      // 최종 폴백 - 클라이언트 사이드 ADMIN_EMAILS 체크
      const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com']
      if (adminEmails.includes(userEmail)) {
        const fallbackPermissions = {
          role: 'admin',
          can_write: true,
          claude_daily_limit: 1000
        }
        console.log('[SupabaseAuthProvider] Using admin email fallback for:', userEmail)
        setPermissions(fallbackPermissions)
        return fallbackPermissions
      }
      
      // 기본값 설정
      setPermissions(null)
      return null
    } catch (error) {
      console.error('[SupabaseAuthProvider] Error in loadPermissions:', error)
      setPermissions(null)
      return null
    }
  }

  useEffect(() => {
    // 초기 세션 가져오기
    console.log('[SupabaseAuthProvider] Initializing auth state')
    
    // 세션 초기화 함수
    const initSession = async () => {
      try {
        // 먼저 세션 가져오기
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[SupabaseAuthProvider] Error getting session:', error)
          // 에러 시 세션 복구 시도
          await supabase.auth.refreshSession()
        } else {
          console.log('[SupabaseAuthProvider] Initial session:', session ? 'Found' : 'Not found')
          if (session?.user?.email) {
            await loadPermissions(session.user.email)
          }
        }
        
        setSession(session)
        setLoading(false)
      } catch (err) {
        console.error('[SupabaseAuthProvider] Session init error:', err)
        setLoading(false)
      }
    }
    
    initSession()

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[SupabaseAuthProvider] Auth state changed:', event, session ? 'Session found' : 'No session')
      
      // 세션 만료 시 자동 갱신 시도
      if (event === 'TOKEN_REFRESHED') {
        console.log('[SupabaseAuthProvider] Token refreshed successfully')
      }
      
      if (session?.user?.email) {
        await loadPermissions(session.user.email)
      } else {
        setPermissions(null)
      }
      
      setSession(session)
      setLoading(false)
      
      // 세션 변경 시 로컬 스토리지와 동기화
      if (typeof window !== 'undefined') {
        if (session) {
          // 세션이 있으면 로컬 스토리지에도 저장 (백업)
          localStorage.setItem('supabase.auth.token', JSON.stringify(session))
        } else {
          // 세션이 없으면 로컬 스토리지에서도 제거
          localStorage.removeItem('supabase.auth.token')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // 로그인 함수
  const signInWithGoogle = async (options = {}) => {
    try {
      // 현재 앱의 origin 확인
      const currentOrigin = window.location.origin
      console.log('Current origin:', currentOrigin)
      
      // 명시적으로 현재 앱의 callback URL 사용
      // Site URL 설정과 관계없이 현재 origin 사용
      const redirectUrl = `${currentOrigin}/auth/callback`
      console.log('Redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'openid email profile',
          skipBrowserRedirect: false,
          ...options
        }
      })

      if (error) throw error
      
      // URL 확인
      if (data?.url) {
        console.log('OAuth URL generated:', data.url)
      }
      
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  // 로그아웃 함수
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // 권한이 포함된 세션 객체 생성
  const enrichedSession = session && permissions ? {
    ...session,
    user: {
      ...session.user,
      isAdmin: permissions?.role === 'admin',
      canWrite: permissions?.can_write || false,
      permissions
    }
  } : session

  const value = {
    session: enrichedSession,
    user: enrichedSession?.user || null,
    loading,
    signInWithGoogle,
    signOut,
    supabase,
    permissions
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    // 컨텍스트가 없을 때 기본값 반환 (에러 대신)
    console.warn('useSupabaseAuth must be used within a SupabaseAuthProvider')
    return {
      session: null,
      loading: true,
      signInWithGoogle: async () => {},
      signOut: async () => {},
      supabase: null
    }
  }
  
  // 디버그용 window 객체에 supabase 노출
  if (typeof window !== 'undefined' && !window.supabase) {
    window.supabase = context.supabase
  }
  
  return context
}