import { getSession } from '@bluenote/supabase-auth/server'

export async function GET(request) {
  try {
    // NextAuth 세션 가져오기
    const session = await getSession()
    
    if (session) {
      return Response.json({
        user: session.user,
        authenticated: true,
        hasUser: true,
        userEmail: session.user?.email,
        status: 200
      })
    }
    
    // 세션이 없는 경우
    return Response.json({ 
      user: null, 
      authenticated: false,
      hasUser: false,
      userEmail: undefined,
      status: 200
    })
    
  } catch (error) {
    console.error('[Quiz Session API] Error:', error)
    return Response.json({ 
      error: 'Internal server error',
      user: null, 
      authenticated: false,
      hasUser: false,
      userEmail: undefined,
      status: 500
    }, { status: 500 })
  }
}