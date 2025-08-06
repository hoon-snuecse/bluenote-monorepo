'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@bluenote/supabase-auth/client'

export default function ClientCallbackHandler() {
  const [status, setStatus] = useState('Processing authentication...')
  const [error, setError] = useState(null)
  const router = useRouter()
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Client callback handler started')
        const supabase = createBrowserClient()
        
        // URL fragment에서 토큰 확인 (Implicit Flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken) {
          console.log('Implicit flow tokens detected')
          setStatus('Setting up session from tokens...')
          
          // Supabase가 자동으로 URL의 토큰을 감지하고 세션을 설정합니다
          // detectSessionInUrl: true 옵션으로 인해 자동 처리됨
          
          // 세션 확인
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            throw sessionError
          }
          
          if (session) {
            console.log('Session established:', session.user.email)
            setStatus('Login successful! Redirecting...')
            
            // URL에서 next 파라미터 확인
            const urlParams = new URLSearchParams(window.location.search)
            const next = urlParams.get('next') || '/create'
            
            setTimeout(() => {
              router.push(next)
            }, 1000)
          } else {
            throw new Error('Session not created after implicit flow')
          }
        } else {
          // code 파라미터 확인 (Authorization Code Flow)
          const urlParams = new URLSearchParams(window.location.search)
          const code = urlParams.get('code')
          
          if (code) {
            console.log('Authorization code flow - handled by server route')
            setStatus('Processing authorization code...')
            // 서버 라우트가 처리하므로 여기서는 대기
          } else {
            setError('No authentication tokens or code found')
          }
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError(err.message)
      }
    }
    
    handleCallback()
  }, [router])
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  )
}