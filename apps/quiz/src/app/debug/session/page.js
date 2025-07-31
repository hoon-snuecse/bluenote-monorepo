'use client'

import { useAuth } from '@bluenote/auth'
import { useEffect, useState } from 'react'

export default function SessionDebugPage() {
  const { user, status } = useAuth()
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 직접 세션 API 호출
    async function checkSession() {
      try {
        setLoading(true)
        const response = await fetch('/api/auth/session', {
          credentials: 'include'
        })
        const data = await response.json()
        setSessionData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Quiz App Session Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Auth Hook Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Direct Session API Call</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Cookies</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {typeof document !== 'undefined' ? document.cookie : 'SSR'}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Environment</h2>
          <div className="space-y-2">
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Main Auth URL:</strong> {process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'Not set'}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <a 
              href="https://www.bluenote.site"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Main Site
            </a>
            <a 
              href="https://www.bluenote.site/auth/signin"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Login on Main Site
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}