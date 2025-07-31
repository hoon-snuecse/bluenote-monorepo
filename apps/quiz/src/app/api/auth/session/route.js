import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    // Next.js cookies API 사용하여 쿠키 읽기
    const cookieStore = await cookies()
    
    // 가능한 세션 토큰 이름들
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
    
    // 디버깅을 위한 모든 쿠키 출력
    const allCookies = cookieStore.getAll()
    console.log('[Quiz Session API] All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    if (!sessionToken) {
      console.log('[Quiz Session API] No session token found');
      return Response.json({ user: null, authenticated: false });
    }
    
    // 쿠키 헤더 재구성
    const cookieHeader = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')

    // 로컬 개발 환경과 프로덕션 환경 구분
    const isProduction = process.env.NODE_ENV === 'production';
    const mainSiteUrl = isProduction 
      ? 'https://bluenote.site' 
      : (process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'http://localhost:3000');

    console.log('[Quiz Session API] Checking session with:', mainSiteUrl);

    // 메인 사이트의 세션 확인 API에 쿠키 전달
    const response = await fetch(`${mainSiteUrl}/api/auth/session-check`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'X-Forwarded-Host': isProduction ? 'quiz.bluenote.site' : 'localhost:3003',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    console.log('[Quiz Session API] Response status:', response.status);

    if (!response.ok) {
      console.log('[Quiz Session API] Session check failed with status:', response.status);
      return Response.json({ user: null });
    }

    const data = await response.json();
    
    // 디버깅을 위한 로그
    console.log('[Quiz Session API] Session check response:', {
      authenticated: data.authenticated,
      hasSession: !!data.session,
      hasUser: !!data.user,
      userEmail: data.user?.email || data.session?.user?.email
    });
    
    // 세션 데이터 반환 - 우선순위: data.user > data.session?.user
    const user = data.user || data.session?.user || null;
    
    if (user) {
      console.log('[Quiz Session API] Found user:', user.email);
    } else {
      console.log('[Quiz Session API] No user found in session data');
    }
    
    return Response.json({
      user: user,
      authenticated: data.authenticated || !!user
    });
    
  } catch (error) {
    console.error('[Quiz Session API] Session check error:', error);
    return Response.json({ user: null });
  }
}