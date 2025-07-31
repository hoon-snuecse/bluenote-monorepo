import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    // 먼저 Quiz 앱 전용 세션 쿠키 확인
    const quizSession = cookieStore.get('quiz-session');
    if (quizSession) {
      try {
        const sessionData = JSON.parse(Buffer.from(quizSession.value, 'base64').toString());
        
        // 세션 만료 확인
        if (new Date(sessionData.expires) > new Date()) {
          console.log('[Quiz Session API] Found valid quiz session for:', sessionData.user.email);
          return Response.json({
            user: sessionData.user,
            authenticated: true
          });
        } else {
          console.log('[Quiz Session API] Quiz session expired');
          // 만료된 세션 쿠키 삭제
          cookieStore.delete('quiz-session');
        }
      } catch (error) {
        console.error('[Quiz Session API] Error parsing quiz session:', error);
        cookieStore.delete('quiz-session');
      }
    }
    
    // Quiz 세션이 없으면 프로덕션에서는 메인 사이트 세션 확인
    if (isProduction) {
      // 요청 헤더에서 쿠키 가져오기
      const cookieHeader = request.headers.get('cookie') || '';
      
      console.log('[Quiz Session API] No quiz session, checking main site session');
      
      // 세션 토큰 찾기
      const sessionTokenMatch = cookieHeader.match(/next-auth\.session-token=([^;]+)/);
      if (!sessionTokenMatch) {
        console.log('[Quiz Session API] No main site session token');
        return Response.json({ 
          user: null, 
          authenticated: false,
          needsSync: true // 동기화 필요 플래그
        });
      }
      
      // www.bluenote.site의 세션 API 직접 호출
      const response = await fetch('https://www.bluenote.site/api/auth/session', {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'Accept': 'application/json',
          'User-Agent': 'Quiz-App-Session-Check',
        },
      });
      
      if (response.ok) {
        const session = await response.json();
        
        if (session && session.user) {
          console.log('[Quiz Session API] Found main site session, needs sync');
          return Response.json({
            user: session.user,
            authenticated: true,
            needsSync: true // 동기화 필요 플래그
          });
        }
      }
      
      console.log('[Quiz Session API] No valid session found');
      return Response.json({ user: null, authenticated: false });
    }
    
    // 개발 환경에서는 기존 로직 사용
    const sessionTokenNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.session-token'
    ]
    
    let sessionToken = null
    for (const name of sessionTokenNames) {
      const token = cookieStore.get(name)
      if (token) {
        sessionToken = token
        console.log(`[Quiz Session API] Found session token: ${name}`)
        break
      }
    }
    
    if (!sessionToken) {
      console.log('[Quiz Session API] No session token found');
      return Response.json({ user: null, authenticated: false });
    }
    
    // 개발 환경에서는 로컬 세션 확인
    const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${mainSiteUrl}/api/auth/session-check`, {
      method: 'GET',
      headers: {
        'Cookie': `next-auth.session-token=${sessionToken.value}`,
        'X-Forwarded-Host': 'localhost:3003',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('[Quiz Session API] Session check failed');
      return Response.json({ user: null, authenticated: false });
    }

    const data = await response.json();
    const user = data.user || data.session?.user || null;
    
    return Response.json({
      user: user,
      authenticated: data.authenticated || !!user
    });
    
  } catch (error) {
    console.error('[Quiz Session API] Error:', error);
    return Response.json({ user: null, authenticated: false });
  }
}