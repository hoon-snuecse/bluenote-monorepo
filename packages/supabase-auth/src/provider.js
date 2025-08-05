'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from './client.js'
import { useRouter } from 'next/navigation'

const SupabaseAuthContext = createContext({})

export function SupabaseAuthProvider({ children, redirectTo = '/' }) {
  const [supabase] = useState(() => createBrowserClient())
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 초기 세션 확인
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
      } catch (error) {
        console.error('Error checking user session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        
        // 로그인 성공 시 리다이렉트 (초기 OAuth 콜백은 제외)
        if (event === 'SIGNED_IN' && redirectTo && !window.location.pathname.includes('/auth/callback')) {
          console.log('Redirecting to:', redirectTo)
          router.push(redirectTo)
        }
        
        // 로그아웃 시 홈으로
        if (event === 'SIGNED_OUT') {
          router.push('/')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, redirectTo])

  // 로그인 함수
  const signInWithGoogle = async (options = {}) => {
    try {
      // 현재 앱의 origin을 state에 저장하여 콜백에서 사용
      const currentOrigin = window.location.origin
      const isProduction = !currentOrigin.includes('localhost')
      
      // 프로덕션에서는 메인 도메인의 콜백 URL 사용, state로 원래 앱 구분
      const callbackUrl = isProduction 
        ? 'https://bluenote.site/auth/callback'
        : `${currentOrigin}/auth/callback`
      
      console.log('OAuth settings:', { currentOrigin, callbackUrl })
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            // state 파라미터에 원래 앱 정보 저장
            state: JSON.stringify({
              returnTo: currentOrigin,
              redirectPath: options.redirectPath || '/create'
            })
          },
          ...options
        }
      })
      
      if (error) throw error
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
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    supabase,
    signInWithGoogle,
    signOut
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

// 커스텀 훅
export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext)
  
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  }
  
  return context
}