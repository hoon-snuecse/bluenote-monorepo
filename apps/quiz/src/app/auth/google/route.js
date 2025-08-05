import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createServerClient()
  const origin = request.headers.get('origin') || 'https://quiz.bluenote.site'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })

  if (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.redirect(new URL('/auth/error', origin))
  }

  if (data?.url) {
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(new URL('/auth/error', origin))
}