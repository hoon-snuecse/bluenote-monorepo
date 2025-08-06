import { createServerClient } from '@supabase/ssr'
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
      console.log('Creating server client...')
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Callback origin:', requestUrl.origin)
      
      const cookieStore = cookies()
      
      // Supabase 클라이언트 생성 - 먼저 세션을 가져오기 위해
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get(name) {
              const value = cookieStore.get(name)?.value
              console.log(`Getting cookie ${name}:`, value ? 'exists' : 'missing')
              return value
            },
            set(name, value, options) {
              console.log(`Setting cookie ${name} (deferred)`)
              // Route Handler에서는 아직 쿠키 설정 안함
            },
            remove(name, options) {
              console.log(`Removing cookie ${name} (deferred)`)
              // Route Handler에서는 아직 쿠키 삭제 안함
            }
          }
        }
      )
      
      console.log('Exchanging code for session...')
      console.log('Code length:', code.length)
      
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
        console.error('Error details:', {
          message: sessionError.message,
          status: sessionError.status,
          code: sessionError.code,
          name: sessionError.name
        })
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
        
        // 리다이렉트 URL 준비
        const callbackUrl = cookieStore.get('auth-callback-url')?.value
        const redirectTo = callbackUrl || '/create'
        const redirectUrl = new URL(redirectTo, requestUrl.origin)
        
        // 응답 생성
        const response = NextResponse.redirect(redirectUrl)
        
        // Supabase 쿠키 수동 설정
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Supabase auth 쿠키 설정
          const cookieOptions = {
            domain: '.bluenote.site',
            secure: true,
            sameSite: 'lax',
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 365 // 1년
          }
          
          // access token 쿠키
          response.cookies.set({
            name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`,
            value: JSON.stringify({
              access_token: session.access_token,
              token_type: 'bearer',
              expires_in: 3600,
              expires_at: Math.floor(new Date(session.expires_at).getTime() / 1000),
              refresh_token: session.refresh_token,
              user: session.user
            }),
            ...cookieOptions
          })
        }
        
        // callbackUrl 쿠키 삭제
        if (callbackUrl) {
          response.cookies.set({
            name: 'auth-callback-url',
            value: '',
            maxAge: 0,
            domain: '.bluenote.site',
            path: '/'
          })
        }
        
        console.log('=== Quiz app auth callback END (success) ===')
        return response
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