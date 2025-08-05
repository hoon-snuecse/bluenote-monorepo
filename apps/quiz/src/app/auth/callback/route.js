import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }
  }

  // 로그인 성공 후 리다이렉트
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/create'
  return NextResponse.redirect(new URL(redirectTo, origin))
}