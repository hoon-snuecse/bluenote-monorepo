import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const cookieStore = cookies();
    
    // 1. Quiz 앱 전용 세션 쿠키 확인
    const quizSession = cookieStore.get('quiz-session');
    if (quizSession) {
      try {
        const sessionData = JSON.parse(Buffer.from(quizSession.value, 'base64').toString());
        
        // 세션 만료 확인
        if (new Date(sessionData.expires) > new Date()) {
          console.log('[Quiz Session API] Found valid quiz session');
          return Response.json({
            user: sessionData.user,
            authenticated: true
          });
        }
      } catch (error) {
        console.error('[Quiz Session API] Error parsing quiz session:', error);
      }
    }
    
    // 2. 메인 사이트 세션 토큰 확인
    const mainSessionToken = cookieStore.get('next-auth.session-token');
    
    if (mainSessionToken) {
      console.log('[Quiz Session API] Found main site session, sync needed');
      
      // 동기화가 필요함을 표시
      return Response.json({ 
        user: null, 
        authenticated: false,
        needsSync: true,
        hasMainSession: true
      });
    }
    
    // 3. 세션이 없는 경우
    console.log('[Quiz Session API] No session found');
    return Response.json({ 
      user: null, 
      authenticated: false 
    });
    
  } catch (error) {
    console.error('[Quiz Session API] Error:', error);
    return Response.json({ 
      error: 'Internal server error',
      user: null, 
      authenticated: false 
    }, { status: 500 });
  }
}