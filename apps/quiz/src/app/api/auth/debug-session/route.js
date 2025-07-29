import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // 세션 확인
    const session = await getServerSession(authOptions)
    
    // 쿠키 목록
    const cookieInfo = allCookies.map(cookie => ({
      name: cookie.name,
      hasValue: !!cookie.value,
      length: cookie.value?.length || 0
    }))
    
    return NextResponse.json({
      session: {
        exists: !!session,
        user: session?.user ? {
          email: session.user.email,
          id: session.user.id,
          name: session.user.name
        } : null
      },
      cookies: cookieInfo,
      authOptions: {
        secret: !!authOptions.secret,
        providers: authOptions.providers?.length || 0,
        cookieConfig: {
          useSecureCookies: authOptions.useSecureCookies,
          domain: authOptions.cookies?.sessionToken?.options?.domain
        }
      },
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        NODE_ENV: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}