'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@bluenote/auth'

export default function AuthDebugPage() {
  const { user, status } = useAuth()
  const [cookies, setCookies] = useState('')
  const [sessionData, setSessionData] = useState(null)
  const [syncData, setSyncData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 클라이언트 사이드 쿠키 확인
    setCookies(document.cookie)
    
    // 세션 API 직접 호출
    fetchSessionData()
  }, [])

  const fetchSessionData = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setSessionData(data)
    } catch (error) {
      setSessionData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testSync = async () => {
    try {
      setSyncData({ status: 'syncing' })
      const response = await fetch('/api/auth/server-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieHeader: document.cookie })
      })
      const data = await response.json()
      setSyncData(data)
      
      // 동기화 후 세션 다시 확인
      setTimeout(fetchSessionData, 1000)
    } catch (error) {
      setSyncData({ error: error.message })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Quiz App Auth Debug</h1>
      
      {/* useAuth 훅 상태 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">useAuth Hook Status</h2>
        <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify({ user, status }, null, 2)}
        </pre>
      </div>

      {/* 쿠키 정보 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Browser Cookies</h2>
        <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto whitespace-pre-wrap">
          {cookies || 'No cookies found'}
        </pre>
      </div>

      {/* 세션 API 응답 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Session API Response</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        )}
        <button
          onClick={fetchSessionData}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Session
        </button>
      </div>

      {/* 동기화 테스트 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Sync Test</h2>
        {syncData && (
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto mb-2">
            {JSON.stringify(syncData, null, 2)}
          </pre>
        )}
        <button
          onClick={testSync}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Server Sync
        </button>
      </div>

      {/* 환경 정보 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Environment Info</h2>
        <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
          {typeof window !== 'undefined' ? JSON.stringify({
            host: window.location.host,
            protocol: window.location.protocol,
            pathname: window.location.pathname,
            userAgent: navigator.userAgent
          }, null, 2) : 'Loading...'}
        </pre>
      </div>
    </div>
  )
}