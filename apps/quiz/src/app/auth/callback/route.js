import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const state = requestUrl.searchParams.get('state')

  console.log('=== Quiz app auth callback START ===')
  console.log('URL:', requestUrl.href)
  console.log('Params:', { 
    code: code ? `${code.substring(0, 10)}...` : 'missing',
    error,
    error_description,
    state: state ? `${state.substring(0, 10)}...` : 'missing'
  })

  // 에러가 있으면 에러 페이지로
  if (error) {
    console.error('OAuth error received:', { error, error_description })
    const errorUrl = new URL('/auth/error', requestUrl.origin)
    errorUrl.searchParams.set('error', error)
    errorUrl.searchParams.set('description', error_description || 'Unknown error')
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    try {
      const cookieStore = cookies()
      console.log('Creating server client...')
      const supabase = createServerClient()
      
      console.log('Exchanging code for session...')
      // 코드를 세션으로 교환
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange result:', {
        success: !sessionError,
        error: sessionError?.message,
        hasSession: !!data?.session,
        hasUser: !!data?.user
      })
      
      if (sessionError) {
        console.error('Session exchange failed:', sessionError)
        const errorUrl = new URL('/auth/error', requestUrl.origin)
        errorUrl.searchParams.set('error', 'session_error')
        errorUrl.searchParams.set('description', sessionError.message)
        return NextResponse.redirect(errorUrl)
      }
      
      if (data?.session) {
        console.log('Session created:', {
          userId: data.user?.id,
          email: data.user?.email,
          expiresAt: data.session.expires_at
        })
        
        // 세션 쿠키가 제대로 설정되었는지 확인
        const { data: { session: verifySession } } = await supabase.auth.getSession()
        console.log('Session verification:', {
          verified: !!verifySession,
          email: verifySession?.user?.email
        })
        
        // callbackUrl 쿠키 확인
        const callbackUrl = cookieStore.get('auth-callback-url')?.value
        const redirectTo = callbackUrl || '/create'
        
        console.log('Redirecting to:', redirectTo)
        console.log('=== Quiz app auth callback END (success) ===')
        
        // callbackUrl 쿠키 삭제
        if (callbackUrl) {
          cookieStore.delete('auth-callback-url')
        }
        
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      } else {
        console.error('No session in response data')
        const errorUrl = new URL('/auth/error', requestUrl.origin)
        errorUrl.searchParams.set('error', 'no_session')
        errorUrl.searchParams.set('description', 'Session was not created')
        return NextResponse.redirect(errorUrl)
      }
    } catch (err) {
      console.error('Callback processing error:', err)
      console.error('Stack trace:', err.stack)
      const errorUrl = new URL('/auth/error', requestUrl.origin)
      errorUrl.searchParams.set('error', 'processing_error')
      errorUrl.searchParams.set('description', err.message)
      return NextResponse.redirect(errorUrl)
    }
  }

  // 코드가 없으면 에러
  console.error('No authorization code provided')
  console.log('=== Quiz app auth callback END (no code) ===')
  const errorUrl = new URL('/auth/error', requestUrl.origin)
  errorUrl.searchParams.set('error', 'missing_code')
  errorUrl.searchParams.set('description', 'Authorization code is missing')
  return NextResponse.redirect(errorUrl)
}