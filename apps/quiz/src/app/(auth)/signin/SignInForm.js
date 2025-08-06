'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@bluenote/supabase-auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@bluenote/ui'
import Image from 'next/image'
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
      
      // direct-oauth route 사용 (Site URL 문제 회피)
      const callbackUrl = searchParams.get('callbackUrl') || '/create'
      const next = encodeURIComponent(callbackUrl)
      window.location.href = `/auth/direct-oauth?next=${next}`
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
            <Image
              src="https://www.google.com/favicon.ico"
              alt="Google"
              width={20}
              height={20}
            />
            {loading ? '로그인 중...' : 'Google로 로그인'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}