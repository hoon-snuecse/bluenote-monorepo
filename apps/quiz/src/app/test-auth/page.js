'use client'

import { useSupabaseAuth } from '@bluenote/supabase-auth'
import { useEffect, useState } from 'react'

export default function TestAuth() {
  const { session, loading, user, supabase } = useSupabaseAuth()
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 세션 정보 가져오기
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        // 사용자 정보 가져오기
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        setDebugInfo({
          sessionFromContext: session ? {
            email: session.user?.email,
            id: session.user?.id,
            expires: session.expires_at
          } : null,
          sessionFromSupabase: currentSession ? {
            email: currentSession.user?.email,
            id: currentSession.user?.id,
            expires: currentSession.expires_at
          } : null,
          userFromSupabase: currentUser ? {
            email: currentUser.email,
            id: currentUser.id
          } : null,
          sessionError: sessionError?.message,
          userError: userError?.message,
          cookies: document.cookie,
          localStorage: {
            'sb-auth-token': localStorage.getItem('sb-auth-token') ? 'exists' : 'missing'
          }
        })
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          error: error.message
        }))
      }
    }

    checkAuth()
  }, [session, supabase])

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Sign in error:', error)
      }
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Current State</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Session: {session ? 'Exists' : 'Missing'}</p>
          <p>User: {user?.email || 'Not logged in'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="flex gap-4">
        {!session ? (
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In with Google
          </button>
        ) : (
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  )
}