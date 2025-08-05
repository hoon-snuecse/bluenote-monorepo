'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@bluenote/supabase-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@bluenote/ui'

export default function DebugAuthPage() {
  const { user, session, loading, supabase } = useSupabaseAuth()
  const [authConfig, setAuthConfig] = useState(null)
  const [currentUrl, setCurrentUrl] = useState('')
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    setCurrentUrl(window.location.href)
    
    // 현재 환경 변수 확인
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-10) : 'NOT SET',
      nodeEnv: process.env.NODE_ENV
    }
    setAuthConfig(config)
    
    // Auth 이벤트 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth event: ${event}, Session: ${session ? 'YES' : 'NO'}`)
    })
    
    return () => subscription.unsubscribe()
  }, [supabase])

  const testGoogleLogin = async () => {
    try {
      addLog('Starting Google OAuth...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'consent',
            access_type: 'offline'
          }
        }
      })
      
      if (error) {
        addLog(`OAuth error: ${error.message}`)
      } else {
        addLog('OAuth initiated successfully')
      }
    } catch (err) {
      addLog(`Exception: ${err.message}`)
    }
  }

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`Session check error: ${error.message}`)
      } else {
        addLog(`Session exists: ${session ? 'YES' : 'NO'}`)
        if (session) {
          addLog(`User email: ${session.user?.email}`)
        }
      }
    } catch (err) {
      addLog(`Session check exception: ${err.message}`)
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        addLog(`Refresh error: ${error.message}`)
      } else {
        addLog(`Session refreshed: ${data.session ? 'SUCCESS' : 'FAILED'}`)
      }
    } catch (err) {
      addLog(`Refresh exception: ${err.message}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔍 Auth Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="bg-gray-100 p-3 rounded space-y-1 text-sm">
              <p>Loading: {loading ? '⏳ Yes' : '✅ No'}</p>
              <p>Authenticated: {user ? '✅ Yes' : '❌ No'}</p>
              <p>User Email: {user?.email || 'Not logged in'}</p>
              <p>Session: {session ? '✅ Active' : '❌ None'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Environment</h3>
            <div className="bg-gray-100 p-3 rounded space-y-1 text-sm font-mono">
              <p>URL: {currentUrl}</p>
              <p>Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
              <p>Supabase URL: {authConfig?.supabaseUrl}</p>
              <p>Anon Key: {authConfig?.supabaseAnonKey}</p>
              <p>Environment: {authConfig?.nodeEnv}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Debug Actions</h3>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={testGoogleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Google OAuth
              </button>
              <button 
                onClick={checkSession}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Check Session
              </button>
              <button 
                onClick={refreshSession}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Refresh Session
              </button>
              <button 
                onClick={() => setLogs([])}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Event Logs</h3>
            <div className="bg-black text-green-400 p-3 rounded h-48 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p>No logs yet...</p>
              ) : (
                logs.map((log, i) => <p key={i}>{log}</p>)
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Troubleshooting Checklist</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Supabase Dashboard에서 Site URL이 https://bluenote.site로 설정됨</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Redirect URLs에 https://quiz.bluenote.site/auth/callback 추가됨</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Google Cloud Console에 Supabase callback URL만 있음</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>브라우저 쿠키/캐시 삭제 완료</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}