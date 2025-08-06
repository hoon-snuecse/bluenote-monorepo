'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@bluenote/supabase-auth/client'

export default function TestDirectAuth() {
  const [logs, setLogs] = useState([])
  const [authConfig, setAuthConfig] = useState(null)
  
  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }
  
  useEffect(() => {
    // Supabase 클라이언트의 auth 설정 확인
    const supabase = createBrowserClient()
    if (supabase.auth && supabase.auth.flowType) {
      setAuthConfig({
        flowType: supabase.auth.flowType,
        detectSessionInUrl: supabase.auth.detectSessionInUrl,
        persistSession: supabase.auth.persistSession
      })
      addLog(`Auth config: ${JSON.stringify(supabase.auth)}`)
    } else {
      addLog('Auth config not accessible directly')
    }
  }, [])
  
  const handleSupabaseOAuth = async () => {
    try {
      addLog('Starting Supabase OAuth with PKCE...')
      
      const supabase = createBrowserClient()
      
      // PKCE flow를 명시적으로 지정
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            response_type: 'code',
            code_challenge_method: 'S256'
          }
        }
      })
      
      if (error) {
        addLog(`Error: ${error.message}`)
      } else {
        addLog(`OAuth initiated: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      addLog(`Exception: ${error.message}`)
    }
  }
  
  const handleDirectOAuth = async () => {
    try {
      addLog('Starting direct OAuth via route...')
      
      // 직접 OAuth route 사용
      window.location.href = '/auth/direct-oauth'
    } catch (error) {
      addLog(`Error: ${error.message}`)
    }
  }
  
  const handleImplicitFlow = async () => {
    try {
      addLog('Starting Implicit flow (for comparison)...')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const redirectUri = `${window.location.origin}/auth/callback`
      
      // Implicit flow parameters
      const params = new URLSearchParams({
        provider: 'google',
        redirect_to: redirectUri,
        response_type: 'token'  // Implicit flow
      })
      
      const authUrl = `${supabaseUrl}/auth/v1/authorize?${params}`
      
      addLog(`Redirecting to: ${authUrl}`)
      window.location.href = authUrl
    } catch (error) {
      addLog(`Error: ${error.message}`)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">OAuth Flow Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Current Auth Config</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {authConfig ? JSON.stringify(authConfig, null, 2) : 'Loading...'}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Test OAuth Methods</h2>
          <div className="space-y-2">
            <button
              onClick={handleSupabaseOAuth}
              className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              1. Supabase Client OAuth (with PKCE)
            </button>
            
            <button
              onClick={handleDirectOAuth}
              className="block w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              2. Direct PKCE Flow
            </button>
            
            <button
              onClick={handleImplicitFlow}
              className="block w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              3. Implicit Flow (for comparison)
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Logs</h2>
          <div className="space-y-1 text-sm font-mono max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-gray-600 break-all">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}