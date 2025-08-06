import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get('next') || '/create'
  
  // Supabase OAuth URL 직접 구성
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const redirectTo = encodeURIComponent(`${requestUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`)
  
  // Implicit flow로 직접 OAuth URL 생성
  const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}&response_type=token&scopes=openid+email+profile`
  
  console.log('Direct OAuth URL:', authUrl)
  
  // Google OAuth로 리다이렉트
  return NextResponse.redirect(authUrl)
}