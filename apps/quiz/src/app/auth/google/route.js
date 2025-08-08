import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get('next') || '/community'
  
  // Use the shared Supabase client from @bluenote/supabase-auth
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient(cookieStore)
  
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