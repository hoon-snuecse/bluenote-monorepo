'use client'

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@bluenote/supabase-auth'

export default function DebugCookiesPage() {
  const [cookies, setCookies] = useState([])
  const [sessionInfo, setSessionInfo] = useState(null)
  const { user, session, loading } = useSupabaseAuth()
  
  useEffect(() => {
    // 클라이언트 사이드 쿠키 확인
    if (typeof document !== 'undefined') {
      const allCookies = document.cookie.split('; ').map(cookie => {
        const [name, value] = cookie.split('=')
        return { 
          name, 
          value: value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : '',
          length: value ? value.length : 0
        }
      })
      setCookies(allCookies)
    }
    
    // 세션 확인 API 호출
    fetch('/api/auth/session-check')
      .then(res => res.json())
      .then(data => setSessionInfo(data))
      .catch(err => console.error('Session check error:', err))
  }, [])
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quiz 앱 쿠키 디버그</h1>
      
      <div className="space-y-6">
        {/* useSupabaseAuth 훅 상태 */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">useSupabaseAuth 훅 상태:</h2>
          <pre className="text-sm">
            {JSON.stringify({
              loading,
              hasUser: !!user,
              userEmail: user?.email,
              hasSession: !!session,
              sessionEmail: session?.user?.email
            }, null, 2)}
          </pre>
        </div>
        
        {/* API 세션 체크 */}
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-bold mb-2">API 세션 체크 (/api/auth/session-check):</h2>
          <pre className="text-sm">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>
        
        {/* 쿠키 목록 */}
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold mb-2">현재 브라우저 쿠키:</h2>
          <div className="space-y-1">
            {cookies.map((cookie, i) => (
              <div key={i} className="text-sm font-mono">
                <span className="font-bold">{cookie.name}:</span> 
                <span className="text-gray-600"> {cookie.value} (길이: {cookie.length})</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 환경 정보 */}
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-bold mb-2">환경 정보:</h2>
          <div className="text-sm space-y-1">
            <div>현재 도메인: {typeof window !== 'undefined' ? window.location.hostname : 'loading...'}</div>
            <div>현재 경로: {typeof window !== 'undefined' ? window.location.pathname : 'loading...'}</div>
            <div>프로토콜: {typeof window !== 'undefined' ? window.location.protocol : 'loading...'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}