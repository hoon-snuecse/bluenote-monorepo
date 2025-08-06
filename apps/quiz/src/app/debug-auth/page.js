'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@bluenote/supabase-auth'

export default function DebugAuth() {
  const [info, setInfo] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const client = createBrowserClient()
        
        // 1. Get current session
        const { data: { session }, error: sessionError } = await client.auth.getSession()
        
        // 2. Get user
        const { data: { user }, error: userError } = await client.auth.getUser()
        
        // 3. Check localStorage
        const localStorageData = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes('supabase')) {
            localStorageData[key] = localStorage.getItem(key)?.substring(0, 100) + '...'
          }
        }
        
        // 4. Check cookies
        const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
          const [name, value] = cookie.split('=')
          if (name.includes('sb-') || name.includes('auth')) {
            acc[name] = value?.substring(0, 50) + '...'
          }
          return acc
        }, {})
        
        setInfo({
          session: session ? {
            user: session.user?.email,
            expires: new Date(session.expires_at * 1000).toLocaleString(),
            provider: session.user?.app_metadata?.provider
          } : 'No session',
          sessionError: sessionError?.message,
          user: user ? {
            email: user.email,
            id: user.id,
            provider: user.app_metadata?.provider
          } : 'No user',
          userError: userError?.message,
          localStorage: localStorageData,
          cookies,
          env: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          },
          url: window.location.href
        })
      } catch (error) {
        setInfo({ error: error.message })
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleSignIn = async () => {
    try {
      const client = createBrowserClient()
      console.log('Starting OAuth flow...')
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`)
      
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      console.log('OAuth initiation result:', { data, error })
      
      if (error) {
        console.error('OAuth error:', error)
        alert('Error: ' + error.message)
      } else {
        console.log('OAuth URL:', data?.url)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleSignOut = async () => {
    try {
      const client = createBrowserClient()
      await client.auth.signOut()
      window.location.reload()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const clearAll = () => {
    // Clear localStorage
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keys.push(key)
      }
    }
    keys.forEach(key => localStorage.removeItem(key))
    
    // Clear all cookies
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/;domain=.bluenote.site')
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    
    window.location.reload()
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Auth</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign In
        </button>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Sign Out
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear All
        </button>
      </div>
      
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
        {JSON.stringify(info, null, 2)}
      </pre>
    </div>
  )
}