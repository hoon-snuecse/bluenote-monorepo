'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@bluenote/supabase-auth/client'

export default function SupabaseDebugPage() {
  const [debugInfo, setDebugInfo] = useState({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const gatherDebugInfo = async () => {
      const supabase = createBrowserClient()
      
      // 현재 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Auth URL 생성 테스트
      const { data: authUrlData, error: authUrlError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true // 실제로 리다이렉트하지 않고 URL만 받기
        }
      })
      
      // localStorage 확인
      const storageKeys = []
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes('supabase')) {
            storageKeys.push({
              key,
              value: localStorage.getItem(key)
            })
          }
        }
      }
      
      // 쿠키 확인
      const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c)
      
      setDebugInfo({
        session: session ? {
          user: session.user.email,
          expires: new Date(session.expires_at * 1000).toLocaleString()
        } : 'No session',
        sessionError: sessionError?.message || 'None',
        authUrl: authUrlData?.url || 'Failed to generate',
        authUrlError: authUrlError?.message || 'None',
        currentOrigin: window.location.origin,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        localStorage: storageKeys,
        cookies: cookies,
        timestamp: new Date().toISOString()
      })
      
      setLoading(false)
    }
    
    gatherDebugInfo()
  }, [])
  
  const handleTestAuth = async () => {
    const supabase = createBrowserClient()
    
    // 실제 OAuth 시작
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      alert(`Error: ${error.message}`)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Current State</h2>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Key Information</h2>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">Current Origin:</dt>
              <dd className="text-gray-600">{debugInfo.currentOrigin}</dd>
            </div>
            <div>
              <dt className="font-medium">Supabase URL:</dt>
              <dd className="text-gray-600">{debugInfo.supabaseUrl}</dd>
            </div>
            <div>
              <dt className="font-medium">Session Status:</dt>
              <dd className="text-gray-600">{typeof debugInfo.session === 'string' ? debugInfo.session : JSON.stringify(debugInfo.session)}</dd>
            </div>
            <div>
              <dt className="font-medium">Generated Auth URL:</dt>
              <dd className="text-gray-600 text-xs break-all">{debugInfo.authUrl}</dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-2">
            <button
              onClick={handleTestAuth}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Google OAuth Login
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}