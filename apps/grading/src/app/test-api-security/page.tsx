'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@bluenote/supabase-auth'

export default function TestApiSecurity() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState('')
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        setToken(session.access_token)
      }
    }
    getSession()
  }, [])

  const testEndpoint = async (endpoint, method = 'GET', body = null) => {
    setLoading(true)
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(body && { body: JSON.stringify(body) })
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [`${method} ${endpoint}`]: {
          status: response.status,
          data,
          success: response.ok
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [`${method} ${endpoint}`]: {
          status: 'error',
          error: error.message
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    // Test basic auth endpoint
    await testEndpoint('/api/test-secured', 'GET')
    
    // Test POST with valid data
    await testEndpoint('/api/test-secured', 'POST', {
      title: '테스트 항목',
      description: '설명',
      priority: 'high'
    })
    
    // Test POST with invalid data (should fail validation)
    await testEndpoint('/api/test-secured', 'POST', {
      title: '', // Empty title should fail
      priority: 'invalid' // Invalid enum value
    })
    
    // Test middleware composition
    await testEndpoint('/api/test-middleware', 'GET')
    
    // Test teacher-only endpoint
    await testEndpoint('/api/test-middleware', 'POST', {
      title: '새 작업',
      description: '미들웨어 테스트',
      priority: 'medium'
    })
    
    // Test PATCH
    await testEndpoint('/api/test-middleware', 'PATCH', {
      title: '업데이트된 작업',
      completed: true
    })
    
    // Test DELETE
    await testEndpoint('/api/test-middleware?id=123', 'DELETE')
  }

  const clearToken = () => {
    setToken('')
    setResults({})
  }

  const login = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    })
    if (data?.session) {
      setUser(data.session.user)
      setToken(data.session.access_token)
    } else {
      alert('로그인 실패: ' + error?.message)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Security 테스트</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">현재 상태</h2>
        <p>사용자: {user?.email || '로그인되지 않음'}</p>
        <p>토큰: {token ? `${token.substring(0, 20)}...` : '없음'}</p>
        
        <div className="mt-4 space-x-2">
          {!user && (
            <button
              onClick={login}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              테스트 로그인
            </button>
          )}
          <button
            onClick={clearToken}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            토큰 제거
          </button>
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '모든 테스트 실행'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">테스트 결과</h2>
        {Object.entries(results).map(([key, result]) => (
          <div 
            key={key} 
            className={`p-4 rounded border ${
              result.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}
          >
            <h3 className="font-semibold mb-2">{key}</h3>
            <p>상태: {result.status}</p>
            <pre className="mt-2 text-sm overflow-auto bg-white p-2 rounded">
              {JSON.stringify(result.data || result.error, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h2 className="text-xl font-semibold mb-2">테스트 시나리오</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>인증 없이 보호된 엔드포인트 접근 (401 예상)</li>
          <li>유효한 토큰으로 접근 (200 예상)</li>
          <li>잘못된 데이터로 POST 요청 (400 예상 - 검증 실패)</li>
          <li>권한이 필요한 엔드포인트 접근 (403 예상 - 권한 없음)</li>
          <li>Rate limiting 테스트 (429 예상 - 너무 많은 요청)</li>
        </ol>
      </div>
    </div>
  )
}