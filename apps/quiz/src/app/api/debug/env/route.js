import { NextResponse } from 'next/server'
import { getSession } from '@bluenote/supabase-auth/server'

export async function GET(request) {
  try {
    // 세션 확인 (관리자만 접근 가능)
    const session = await getSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    // 관리자 이메일 확인
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: '관리자만 접근 가능합니다.' },
        { status: 403 }
      )
    }
    
    // 환경 변수 확인 (민감한 정보는 일부만 표시)
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '설정됨' : '미설정',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : '미설정',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
        process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : '미설정',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '설정됨' : '미설정',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '설정됨' : '미설정',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '설정됨' : '미설정',
      ADMIN_EMAILS: process.env.ADMIN_EMAILS
    }
    
    return NextResponse.json({
      message: '환경 변수 상태',
      envVars
    })
    
  } catch (error) {
    console.error('[debug env] Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}