'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@bluenote/supabase-auth'

export default function SupabaseTest() {
  const [logs, setLogs] = useState([])
  const [sessionInfo, setSessionInfo] = useState(null)

  const addLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, message, data }])
    console.log(`[${timestamp}] ${message}`, data || '')
  }

  useEffect(() => {
    checkInitialState()
  }, [])

  const checkInitialState = async () => {
    try {
      const supabase = createBrowserClient()
      
      // 1. 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession()
      addLog('Initial session check', { 
        hasSession: !!session, 
        error: error?.message,
        user: session?.user?.email 
      })
      
      if (session) {
        setSessionInfo(session)
      }
      
      // 2. Auth 상태 리스너
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        addLog(`Auth state changed: ${event}`, {
          hasSession: !!session,
          user: session?.user?.email
        })
        
        if (session) {
          setSessionInfo(session)
        } else {
          setSessionInfo(null)
        }
      })
      
      return () => subscription.unsubscribe()
    } catch (error) {
      addLog('Error during initialization', error.message)
    }
  }

  const handleDirectSignIn = async () => {
    try {
      const supabase = createBrowserClient()
      
      // redirectTo를 명시적으로 설정
      const redirectTo = `${window.location.origin}/auth/callback`
      
      addLog('Starting OAuth flow', { redirectTo })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false
        }
      })
      
      if (error) {
        addLog('OAuth error', error)
      } else {
        addLog('OAuth initiated', { url: data?.url })
      }
    } catch (error) {
      addLog('Sign in error', error.message)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        addLog('Sign out error', error)
      } else {
        addLog('Signed out successfully')
        setSessionInfo(null)
      }
    } catch (error) {
      addLog('Sign out error', error.message)
    }
  }

  const clearEverything = () => {
    // Clear all localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear all cookies
    document.cookie.split(';').forEach(c => {
      const eqPos = c.indexOf('=')
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.bluenote.site`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
    
    addLog('Cleared all auth data')
    window.location.reload()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Auth Test</h1>
      
      <div className="grid grid-cols-2 gap-6">
        {/* 왼쪽: 컨트롤 */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={handleDirectSignIn}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign In with Google
              </button>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Sign Out
              </button>
              <button
                onClick={clearEverything}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear Everything
              </button>
              <button
                onClick={checkInitialState}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Refresh Status
              </button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Current Session</h2>
            {sessionInfo ? (
              <div className="text-sm space-y-1">
                <p><strong>User:</strong> {sessionInfo.user?.email}</p>
                <p><strong>Provider:</strong> {sessionInfo.user?.app_metadata?.provider}</p>
                <p><strong>Expires:</strong> {new Date(sessionInfo.expires_at * 1000).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-gray-500">No active session</p>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Environment</h2>
            <div className="text-sm space-y-1">
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* 오른쪽: 로그 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-3">Event Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-b pb-2">
                  <div className="text-xs text-gray-500">{log.timestamp}</div>
                  <div className="text-sm font-medium">{log.message}</div>
                  {log.data && (
                    <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}