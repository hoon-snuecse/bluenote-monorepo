import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const supabase = createServerClient()

  // 로그아웃
  await supabase.auth.signOut()

  // 홈으로 리다이렉트
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}