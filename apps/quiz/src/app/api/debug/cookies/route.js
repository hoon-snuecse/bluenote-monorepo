import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  // 세션 정보 가져오기
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Failed to get session:', error)
  }
  
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
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET'
    },
    session: {
      exists: !!session,
      user_email: session?.user?.email,
      user_id: session?.user?.id
    },
    cookies: {
      all: cookieInfo,
      auth: authCookies,
      count: allCookies.length
    },
    timestamp: new Date().toISOString()
  })
}