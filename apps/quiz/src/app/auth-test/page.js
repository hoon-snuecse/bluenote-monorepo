'use client'

import { useState } from 'react'

export default function AuthTestPage() {
  const [authUrl, setAuthUrl] = useState('')
  
  const generateAuthUrl = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const origin = window.location.origin
    const callbackUrl = `${origin}/auth/callback`
    
    // Implicit flow URL
    const params = new URLSearchParams({
      provider: 'google',
      redirect_to: callbackUrl,
      response_type: 'token',
      scopes: 'openid email profile'
    })
    
    const url = `${supabaseUrl}/auth/v1/authorize?${params.toString()}`
    setAuthUrl(url)
  }
  
  const testDirectOAuth = () => {
    window.location.href = '/auth/direct-oauth'
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Environment Check</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium">Supabase URL:</dt>
              <dd className="text-gray-600">{process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not defined'}</dd>
            </div>
            <div>
              <dt className="font-medium">Current Origin:</dt>
              <dd className="text-gray-600">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Generate Auth URL</h2>
          <button
            onClick={generateAuthUrl}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate OAuth URL
          </button>
          
          {authUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Generated URL:</p>
              <div className="p-2 bg-gray-100 rounded text-xs break-all">
                {authUrl}
              </div>
              <a
                href={authUrl}
                className="mt-2 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Test This URL
              </a>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Direct OAuth Route</h2>
          <button
            onClick={testDirectOAuth}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test /auth/direct-oauth
          </button>
        </div>
      </div>
    </div>
  )
}