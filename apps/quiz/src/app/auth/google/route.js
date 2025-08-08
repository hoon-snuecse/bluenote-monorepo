import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 환경 변수
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get('next') || '/community'
  
  // 직접 Supabase 클라이언트 생성
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // OAuth URL 생성
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })

  if (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.redirect(new URL('/auth/error?error=' + encodeURIComponent(error.message), origin))
  }

  if (data?.url) {
    console.log('Redirecting to Google OAuth:', data.url)
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(new URL('/auth/error?error=OAuth URL not generated', origin))
}