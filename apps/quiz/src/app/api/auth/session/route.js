import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    // Next.js cookies API 사용하여 쿠키 읽기
    const cookieStore = await cookies()
    
    // 프로덕션 환경 체크
    const isProduction = process.env.NODE_ENV === 'production';
    
    // 프로덕션에서는 도메인 간 쿠키 공유를 위해 직접 세션 확인
    if (isProduction) {
      // 모든 쿠키를 헤더로 전달
      const allCookies = cookieStore.getAll()
      const cookieHeader = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
      
      console.log('[Quiz Session API] Production mode - forwarding cookies to main site');
      console.log('[Quiz Session API] Cookie count:', allCookies.length);
      
      // www.bluenote.site의 세션 API 직접 호출
      const response = await fetch('https://www.bluenote.site/api/auth/session', {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'Accept': 'application/json',
          'User-Agent': 'Quiz-App-Session-Check',
        },
        // 서버 사이드에서는 credentials 옵션 불필요
      });
      
      console.log('[Quiz Session API] Main site response status:', response.status);
      
      if (response.ok) {
        const session = await response.json();
        
        // NextAuth 세션 형식으로 반환
        if (session && session.user) {
          console.log('[Quiz Session API] Found session for user:', session.user.email);
          return Response.json({
            user: session.user,
            authenticated: true
          });
        }
      }
      
      console.log('[Quiz Session API] No valid session found from main site');
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