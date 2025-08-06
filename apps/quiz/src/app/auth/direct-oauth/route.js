import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const next = requestUrl.searchParams.get('next') || '/create'
    
    // Supabase OAuth URL 직접 구성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    }
    
    // callback URL 구성 - next 파라미터는 별도로 전달
    const callbackUrl = `${requestUrl.origin}/auth/callback`
    
    // OAuth URL 파라미터 구성
    const params = new URLSearchParams({
      provider: 'google',
      redirect_to: callbackUrl,
      response_type: 'token',
      scopes: 'openid email profile',
      // next 파라미터를 state에 포함
      state: JSON.stringify({ next })
    })
    
    // 최종 URL 생성
    const authUrl = `${supabaseUrl}/auth/v1/authorize?${params.toString()}`
    
    console.log('Direct OAuth request:', {
      origin: requestUrl.origin,
      next,
      callbackUrl,
      authUrl
    })
    
    // Google OAuth로 리다이렉트
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Direct OAuth error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}