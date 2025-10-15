import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)

    // 현재 세션 가져오기
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 권한 정보 설정 (admin 확인)
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com']
    const isAdmin = adminEmails.includes(session.user.email)

    // 사용자 권한 정보 반환
    const permissions = {
      user_email: session.user.email,
      role: isAdmin ? 'admin' : 'user',
      can_write: true,
      claude_daily_limit: isAdmin ? 1000 : 10
    }

    return NextResponse.json(permissions)

  } catch (error) {
    console.error('[Quiz Permissions] Unexpected error:', error)

    // 에러 시 기본 권한 반환
    return NextResponse.json({
      user_email: '',
      role: 'user',
      can_write: true,
      claude_daily_limit: 10
    })
  }
}
