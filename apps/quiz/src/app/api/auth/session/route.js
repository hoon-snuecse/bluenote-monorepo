import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // 디버깅: 쿠키 확인
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')
    console.log('Session token cookie:', sessionToken)
    
    const session = await getServerSession(authOptions)
    console.log('Session from getServerSession:', session)
    
    // 세션이 있으면 세션 정보 반환
    if (session) {
      return NextResponse.json(session)
    }
    
    // 세션이 없으면 null 반환
    return NextResponse.json(null)
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(null)
  }
}