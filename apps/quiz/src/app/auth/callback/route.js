import { createClient } from '@bluenote/supabase-auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 로그인 성공 후 리다이렉트
  return NextResponse.redirect(new URL('/create', request.url))
}