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

  // 권한 정보 로드 함수
  const loadPermissions = async (userEmail) => {
    if (!userEmail) {
      setPermissions(null)
      return null
    }
    
    try {
      console.log('[SupabaseAuthProvider] Loading permissions for:', userEmail)
      const { data, error } = await supabase
        .from('user_permissions')
        .select('role, can_write, claude_daily_limit')
        .eq('email', userEmail)
        .single()
      
      if (error) {
        console.error('[SupabaseAuthProvider] Error loading permissions:', error)
        // ADMIN_EMAILS 체크 (폴백)
        const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com']
        if (adminEmails.includes(userEmail)) {
          const fallbackPermissions = {
            role: 'admin',
            can_write: true,
            claude_daily_limit: 1000
          }
          setPermissions(fallbackPermissions)
          return fallbackPermissions
        }
        setPermissions(null)
        return null
      }
      
      console.log('[SupabaseAuthProvider] Permissions loaded:', data)
      setPermissions(data)
      return data
    } catch (error) {
      console.error('[SupabaseAuthProvider] Error in loadPermissions:', error)
      setPermissions(null)
      return null
    }
  }

  useEffect(() => {
    // 초기 세션 가져오기
    console.log('[SupabaseAuthProvider] Initializing auth state')
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('[SupabaseAuthProvider] Error getting session:', error)
      } else {
        console.log('[SupabaseAuthProvider] Initial session:', session ? 'Found' : 'Not found')
        if (session?.user?.email) {
          await loadPermissions(session.user.email)
        }
      }
      setSession(session)
      setLoading(false)
    })

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[SupabaseAuthProvider] Auth state changed:', event, session ? 'Session found' : 'No session')
      
      if (session?.user?.email) {
        await loadPermissions(session.user.email)
      } else {
        setPermissions(null)
      }
      
      setSession(session)
      setLoading(false)
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
    loading,
    signInWithGoogle,
    signOut,
    supabase
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