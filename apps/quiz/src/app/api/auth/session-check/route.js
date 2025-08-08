import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // 현재 세션 가져오기
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[Quiz Session Check] Error:', error)
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: error.message
      })
    }
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }
    
    // 권한 정보 가져오기 (admin 확인)
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com']
    const isAdmin = adminEmails.includes(session.user.email)
    
    // 사용자 권한 정보
    const permissions = {
      role: isAdmin ? 'admin' : 'user',
      can_write: true,
      claude_daily_limit: isAdmin ? 1000 : 10
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        ...session.user,
        permissions
      }
    })
    
  } catch (error) {
    console.error('[Quiz Session Check] Unexpected error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}