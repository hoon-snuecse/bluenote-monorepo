'use client'

import { useSupabaseAuth } from '@bluenote/supabase-auth'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

function SignInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signInWithGoogle, loading, user } = useSupabaseAuth()
  const callbackUrl = searchParams.get('callbackUrl') || '/create'
  
  useEffect(() => {
    // 이미 로그인된 경우 리다이렉트
    if (user && !loading) {
      router.push(callbackUrl)
    }
  }, [user, loading, callbackUrl, router])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-md">
              K
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kahoot 퀴즈 메이커
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI로 만드는 스마트한 퀴즈
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                로그인 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 로그인
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}