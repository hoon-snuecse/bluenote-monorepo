import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  // 쿠키 정보를 안전하게 반환
  const cookieInfo = allCookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value ? '***' : 'empty', // 값은 숨김
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    domain: cookie.domain,
    path: cookie.path
  }))
  
  // NextAuth 관련 쿠키만 필터링
  const authCookies = cookieInfo.filter(c => 
    c.name.includes('next-auth') || 
    c.name.includes('__Secure-next-auth') ||
    c.name.includes('__Host-next-auth')
  )
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    nextauth_url: process.env.NEXTAUTH_URL,
    all_cookies: cookieInfo,
    auth_cookies: authCookies,
    cookie_count: allCookies.length
  })
}