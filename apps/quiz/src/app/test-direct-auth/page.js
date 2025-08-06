'use client'

import { useState } from 'react'

export default function TestDirectAuth() {
  const [status, setStatus] = useState('')

  const handleSupabaseDirectAuth = () => {
    // Supabase의 직접 OAuth URL로 이동
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const redirectTo = encodeURIComponent(`${window.location.origin}/auth/callback`)
    
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`
    
    setStatus(`Redirecting to: ${authUrl}`)
    window.location.href = authUrl
  }

  const handleClearAndTest = () => {
    // 모든 쿠키 삭제
    document.cookie.split(';').forEach(c => {
      const eqPos = c.indexOf('=')
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
      if (name) {
        // 모든 도메인에서 삭제 시도
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.bluenote.site`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=quiz.bluenote.site`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
    })
    
    // localStorage 삭제
    localStorage.clear()
    
    setStatus('Cleared all cookies and localStorage')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Direct Supabase Auth Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm mb-2">Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p className="text-sm">Current Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={handleClearAndTest}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Cookies & Storage
          </button>
          
          <button
            onClick={handleSupabaseDirectAuth}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Direct Supabase OAuth
          </button>
        </div>
        
        {status && (
          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-sm">{status}</p>
          </div>
        )}
      </div>
    </div>
  )
}