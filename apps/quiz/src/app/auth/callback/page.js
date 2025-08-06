'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@bluenote/supabase-auth'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient()
      
      // URL에서 에러 확인
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')
      
      if (error) {
        console.error('OAuth error:', error, errorDescription)
        router.push(`/auth/error?error=${error}&description=${encodeURIComponent(errorDescription || '')}`)
        return
      }
      
      // 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        router.push('/auth/error?error=session_error')
        return
      }
      
      if (session) {
        console.log('Session found, redirecting to /create')
        router.push('/create')
      } else {
        console.log('No session found')
        router.push('/auth/error?error=no_session')
      }
    }
    
    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
}