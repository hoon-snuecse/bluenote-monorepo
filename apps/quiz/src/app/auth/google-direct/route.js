import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const next = requestUrl.searchParams.get('next') || '/create'
    
    // Google OAuth 직접 구성
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    if (!googleClientId) {
      throw new Error('GOOGLE_CLIENT_ID is not defined')
    }
    
    // Google OAuth 2.0 endpoint
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    
    // callback URL - 우리가 직접 처리
    const redirectUri = `${requestUrl.origin}/auth/google-callback`
    
    // Google OAuth 파라미터
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      state: JSON.stringify({ next }),
      // 도메인 제한 (선택사항)
      hd: 'snuecse.org',
      prompt: 'select_account'
    })
    
    const authUrl = `${googleAuthUrl}?${params.toString()}`
    
    console.log('Google Direct OAuth:', {
      origin: requestUrl.origin,
      redirectUri,
      authUrl
    })
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Google Direct OAuth error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}