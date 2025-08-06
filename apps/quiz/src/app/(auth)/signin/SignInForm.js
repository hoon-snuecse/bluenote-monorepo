'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@bluenote/supabase-auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@bluenote/ui'
import { useSearchParams } from 'next/navigation'

export default function SignInForm() {
  const { signInWithGoogle } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // callbackUrl을 쿠키에 저장
    const callbackUrl = searchParams.get('callbackUrl')
    if (callbackUrl) {
      document.cookie = `auth-callback-url=${callbackUrl}; path=/; max-age=3600`
    }
  }, [searchParams])

  const handleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const callbackUrl = searchParams.get('callbackUrl') || '/create'
      
      // 공통 클라이언트의 signInWithGoogle 사용
      const { error } = await signInWithGoogle({
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
      })
      
      if (error) {
        throw error
      }
    } catch (err) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>
            Google 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? '로그인 중...' : 'Google로 로그인'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}