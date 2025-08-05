import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const state = requestUrl.searchParams.get('state')

  console.log('Auth callback received:', { 
    origin, 
    code: code ? 'present' : 'missing',
    state,
    url: request.url 
  })

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }
    
    console.log('Session exchanged successfully:', data?.user?.email)
  }

  // 로그인 성공 후 리다이렉트
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/create'
  const redirectUrl = new URL(redirectTo, origin)
  
  console.log('Redirecting to:', redirectUrl.toString())
  return NextResponse.redirect(redirectUrl)
}