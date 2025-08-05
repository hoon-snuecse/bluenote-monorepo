import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  console.log('Quiz app auth callback received:', { 
    origin: requestUrl.origin,
    code: code ? 'present' : 'missing',
    error,
    error_description
  })

  // 에러가 있으면 에러 페이지로
  if (error) {
    console.error('OAuth error:', error, error_description)
    const errorUrl = new URL('/auth/error', requestUrl.origin)
    errorUrl.searchParams.set('error', error)
    errorUrl.searchParams.set('description', error_description || 'Unknown error')
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    try {
      const supabase = createServerClient()
      
      // 코드를 세션으로 교환
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError)
        const errorUrl = new URL('/auth/error', requestUrl.origin)
        errorUrl.searchParams.set('error', 'session_error')
        errorUrl.searchParams.set('description', sessionError.message)
        return NextResponse.redirect(errorUrl)
      }
      
      console.log('Session created successfully:', {
        user: data?.user?.email,
        session: data?.session ? 'exists' : 'missing'
      })
      
      // 세션이 생성되었으면 /create로 리다이렉트
      if (data?.session) {
        return NextResponse.redirect(new URL('/create', requestUrl.origin))
      }
    } catch (err) {
      console.error('Callback processing error:', err)
      const errorUrl = new URL('/auth/error', requestUrl.origin)
      errorUrl.searchParams.set('error', 'processing_error')
      errorUrl.searchParams.set('description', err.message)
      return NextResponse.redirect(errorUrl)
    }
  }

  // 코드가 없으면 에러
  const errorUrl = new URL('/auth/error', requestUrl.origin)
  errorUrl.searchParams.set('error', 'missing_code')
  errorUrl.searchParams.set('description', 'Authorization code is missing')
  return NextResponse.redirect(errorUrl)
}