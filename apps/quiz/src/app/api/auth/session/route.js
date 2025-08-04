import { cookies } from 'next/headers'
import { getToken } from 'next-auth/jwt'

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    
    // 1. Quiz 앱 전용 세션 쿠키 확인
    const quizSession = cookieStore.get('quiz-session');
    if (quizSession) {
      try {
        const sessionData = JSON.parse(Buffer.from(quizSession.value, 'base64').toString());
        
        // 세션 만료 확인
        if (new Date(sessionData.expires) > new Date()) {
          return Response.json({
            user: sessionData.user,
            authenticated: true
          });
        }
      } catch (error) {
        // Error parsing quiz session
      }
    }
    
    // 2. NextAuth JWT 토큰으로 세션 확인
    const isProd = process.env.NODE_ENV === 'production';
    console.log('[Quiz Session API] Environment:', process.env.NODE_ENV);
    console.log('[Quiz Session API] Checking token with secret:', process.env.NEXTAUTH_SECRET?.substring(0, 10) + '...');
    console.log('[Quiz Session API] Available cookies:', Array.from(cookieStore.getAll()).map(c => c.name));
    
    // 프로덕션에서는 여러 쿠키 이름을 시도
    let token = null;
    
    if (isProd) {
      // 프로덕션 환경에서 가능한 쿠키 이름들 시도
      const cookieNames = [
        '__Secure-next-auth.session-token',
        'next-auth.session-token',
        '__Host-next-auth.session-token'
      ];
      
      for (const cookieName of cookieNames) {
        try {
          token = await getToken({ 
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: true,
            cookieName: cookieName
          });
          
          if (token) {
            console.log('[Quiz Session API] Token found with cookie name:', cookieName);
            break;
          }
        } catch (err) {
          console.log('[Quiz Session API] Failed to get token with cookie name:', cookieName);
        }
      }
    } else {
      // 개발 환경
      token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: false,
        cookieName: 'next-auth.session-token'
      });
    }
    
    console.log('[Quiz Session API] Token result:', token ? 'Token found' : 'No token');
    
    if (token) {
      // 토큰이 있으면 인증된 상태로 반환
      console.log('[Quiz Session API] Token email:', token.email);
      return Response.json({
        user: {
          email: token.email,
          name: token.name,
          image: token.image,
          id: token.sub,
          isAdmin: token.isAdmin,
          canWrite: token.canWrite
        },
        authenticated: true,
        hasUser: true,
        userEmail: token.email,
        status: 200
      });
    }
    
    // 3. 메인 사이트 세션 토큰 확인 (fallback)
    const mainSessionToken = cookieStore.get('next-auth.session-token');
    
    if (mainSessionToken) {
      // 토큰이 있지만 getToken이 실패한 경우
      // 이미 위에서 토큰 검증을 시도했으므로 여기서는 세션이 없는 것으로 처리
      console.log('[Quiz Session API] Main session token exists but could not decode');
    }
    
    // 4. 세션이 없는 경우
    return Response.json({ 
      user: null, 
      authenticated: false,
      hasUser: false,
      userEmail: undefined,
      status: 200
    });
    
  } catch (error) {
    console.error('[Quiz Session API] Error:', error);
    return Response.json({ 
      error: 'Internal server error',
      user: null, 
      authenticated: false,
      hasUser: false,
      userEmail: undefined,
      status: 500
    }, { status: 500 });
  }
}