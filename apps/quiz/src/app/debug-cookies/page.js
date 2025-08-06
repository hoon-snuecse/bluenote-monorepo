'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@bluenote/supabase-auth/client'

export default function DebugCookiesPage() {
  const [cookies, setCookies] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 쿠키 파싱
    const parsedCookies = document.cookie.split('; ').map(cookie => {
      const [name, value] = cookie.split('=')
      return { name, value: decodeURIComponent(value || '') }
    })
    setCookies(parsedCookies)
    
    // Supabase 세션 확인
    const checkSession = async () => {
      const supabase = createBrowserClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Session check:', { session, error })
      setSession(session)
      setLoading(false)
    }
    
    checkSession()
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">쿠키 및 세션 디버그</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">현재 도메인</h2>
          <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">모든 쿠키</h2>
          <div className="space-y-2">
            {cookies.map((cookie, idx) => (
              <div key={idx} className="border-b pb-2">
                <p className="text-sm font-medium">{cookie.name}</p>
                <p className="text-xs text-gray-600 break-all">
                  {cookie.value.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Supabase 세션</h2>
          {loading ? (
            <p>확인 중...</p>
          ) : session ? (
            <div className="space-y-2">
              <p className="text-sm"><strong>사용자 ID:</strong> {session.user.id}</p>
              <p className="text-sm"><strong>이메일:</strong> {session.user.email}</p>
              <p className="text-sm"><strong>Provider:</strong> {session.user.app_metadata?.provider}</p>
              <p className="text-sm"><strong>만료:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-600">세션이 없습니다</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Supabase Auth 쿠키</h2>
          <div className="space-y-2">
            {cookies
              .filter(c => c.name.includes('sb-') && c.name.includes('-auth-token'))
              .map((cookie, idx) => (
                <div key={idx} className="border-b pb-2">
                  <p className="text-sm font-medium">{cookie.name}</p>
                  <p className="text-xs text-gray-600">
                    길이: {cookie.value.length} 문자
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}