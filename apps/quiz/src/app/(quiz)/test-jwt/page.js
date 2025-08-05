'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@bluenote/supabase-auth'

export default function TestJWTPage() {
  const { session } = useSupabaseAuth()
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runJWTTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-jwt')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const runSupabaseRLSTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-service-role')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">JWT 토큰 테스트</h1>
        <p className="mt-1 text-sm text-gray-600">
          NextAuth JWT 토큰과 Supabase RLS 통합을 테스트합니다.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">현재 세션 정보</h2>
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">테스트 실행</h2>
        <div className="space-x-4">
          <button
            onClick={runJWTTest}
            disabled={loading || status !== 'authenticated'}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            JWT 토큰 테스트
          </button>
          <button
            onClick={runSupabaseRLSTest}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Service Role 테스트
          </button>
        </div>
      </div>

      {testResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">테스트 결과</h2>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}