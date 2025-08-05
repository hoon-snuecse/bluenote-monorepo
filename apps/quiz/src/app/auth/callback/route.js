import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Quiz app auth callback received:', { 
    origin: requestUrl.origin,
    code: code ? 'present' : 'missing'
  })

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
    }
    
    console.log('Session exchanged successfully:', data?.user?.email)
  }

  // Quiz 앱에서는 항상 /create로 리다이렉트
  const redirectUrl = new URL('/create', requestUrl.origin)
  return NextResponse.redirect(redirectUrl)
}