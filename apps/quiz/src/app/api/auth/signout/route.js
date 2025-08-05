import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // @bluenote/auth 공유 세션 쿠키 삭제
    const cookieStore = cookies()
    
    // 공유 세션 쿠키 이름들
    const sessionCookieName = 'next-auth.session-token'
    const callbackCookieName = 'next-auth.callback-url'
    const csrfCookieName = 'next-auth.csrf-token'
    
    // 쿠키 삭제 - 도메인을 .bluenote.site로 설정하여 모든 서브도메인에서 삭제
    cookieStore.delete({
      name: sessionCookieName,
      domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined,
      path: '/',
    })
    
    cookieStore.delete({
      name: callbackCookieName,
      domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined,
      path: '/',
    })
    
    cookieStore.delete({
      name: csrfCookieName,
      domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined,
      path: '/',
    })
    
    return NextResponse.json({ 
      success: true,
      message: '로그아웃되었습니다.' 
    })
  } catch (error) {
    console.error('[Quiz Signout API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}