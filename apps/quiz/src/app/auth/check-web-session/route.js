import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    // Web 앱에서 생성된 세션 토큰 확인
    const sessionToken = cookieStore.get('next-auth.session-token')
    const csrfToken = cookieStore.get('next-auth.csrf-token')
    
    return NextResponse.json({
      hasWebSession: !!sessionToken,
      cookies: {
        sessionToken: !!sessionToken,
        csrfToken: !!csrfToken,
      },
      message: sessionToken 
        ? 'Web 앱 세션이 감지되었습니다. Quiz 앱에서도 사용 가능합니다.'
        : 'Web 앱 세션이 없습니다. 먼저 bluenote.site에서 로그인해주세요.',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}