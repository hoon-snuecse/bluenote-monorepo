'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from './client.js'
import { useRouter } from 'next/navigation'

const SupabaseAuthContext = createContext({})

export function SupabaseAuthProvider({ children, redirectTo = '/' }) {
  const [supabase] = useState(() => createBrowserClient())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 초기 세션 확인
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
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
        setUser(session?.user ?? null)
        
        // 로그인 성공 시 리다이렉트
        if (event === 'SIGNED_IN' && redirectTo) {
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
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
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
    user,
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