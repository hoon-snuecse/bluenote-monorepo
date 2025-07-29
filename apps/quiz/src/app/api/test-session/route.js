import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // 쿠키 확인
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')
    const secureSessionToken = cookieStore.get('__Secure-next-auth.session-token')
    
    // 세션 확인
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      cookies: {
        'next-auth.session-token': sessionToken?.value ? 'exists' : 'not found',
        '__Secure-next-auth.session-token': secureSessionToken?.value ? 'exists' : 'not found',
        allCookies: cookieStore.getAll().map(c => c.name)
      },
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
        NEXT_PUBLIC_MAIN_AUTH_URL: process.env.NEXT_PUBLIC_MAIN_AUTH_URL
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}