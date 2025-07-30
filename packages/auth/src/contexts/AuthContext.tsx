'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AuthContextValue, AuthProviderProps, AuthUser, AuthStatus } from '../types'
import { FetchAdapter } from '../adapters/fetch'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children, adapter, options }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  
  // 기본 어댑터는 FetchAdapter (Quiz 앱에서 주로 사용)
  const authAdapter = adapter || new FetchAdapter(options)

  useEffect(() => {
    // 초기 세션 로드
    setStatus('loading')
    authAdapter.getSession()
      .then(sessionUser => {
        setUser(sessionUser)
        setStatus(sessionUser ? 'authenticated' : 'unauthenticated')
      })
      .catch(error => {
        console.error('Error loading session:', error)
        setUser(null)
        setStatus('unauthenticated')
      })

    // 세션 변경 구독 (어댑터가 지원하는 경우)
    if (authAdapter.subscribeToChanges) {
      const unsubscribe = authAdapter.subscribeToChanges((sessionUser) => {
        setUser(sessionUser)
        setStatus(sessionUser ? 'authenticated' : 'unauthenticated')
      })

      return unsubscribe
    }
  }, [authAdapter])

  const signIn = async (provider?: string) => {
    try {
      setStatus('loading')
      await authAdapter.signIn(provider)
    } catch (error) {
      console.error('Sign in error:', error)
      setStatus('unauthenticated')
      throw error
    }
  }

  const signOut = async () => {
    try {
      setStatus('loading')
      await authAdapter.signOut()
      setUser(null)
      setStatus('unauthenticated')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value: AuthContextValue = {
    user,
    status,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}