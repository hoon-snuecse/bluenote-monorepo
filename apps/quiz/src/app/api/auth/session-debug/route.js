import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // 쿠키 정보
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('next-auth.session-token') || 
                       cookieStore.get('__Secure-next-auth.session-token')
    
    return NextResponse.json({
      session: session || null,
      hasSession: !!session,
      sessionToken: !!sessionToken,
      cookies: {
        'next-auth.session-token': !!cookieStore.get('next-auth.session-token'),
        '__Secure-next-auth.session-token': !!cookieStore.get('__Secure-next-auth.session-token'),
        'next-auth.csrf-token': !!cookieStore.get('next-auth.csrf-token'),
        '__Host-next-auth.csrf-token': !!cookieStore.get('__Host-next-auth.csrf-token'),
      },
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}