import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const callbackUrl = searchParams.get('callbackUrl') || '/create'
    
    // Web 앱에서 설정된 세션 토큰 확인
    const cookieStore = cookies()
    
    // 프로덕션 환경에서 사용되는 보안 쿠키 이름들
    const secureSessionToken = cookieStore.get('__Secure-next-auth.session-token')
    const sessionToken = cookieStore.get('next-auth.session-token')
    
    console.log('Sync session - cookies found:', {
      secure: !!secureSessionToken,
      regular: !!sessionToken
    })
    
    // 세션이 있으면 callbackUrl로 리다이렉트
    if (secureSessionToken || sessionToken) {
      return NextResponse.redirect(new URL(callbackUrl, request.url))
    }
    
    // 세션이 없으면 Web 앱으로 리다이렉트하여 로그인 유도
    const webAuthUrl = new URL('https://bluenote.site/auth/signin')
    webAuthUrl.searchParams.set('callbackUrl', `https://quiz.bluenote.site${callbackUrl}`)
    
    return NextResponse.redirect(webAuthUrl)
  } catch (error) {
    console.error('Sync session error:', error)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }
}