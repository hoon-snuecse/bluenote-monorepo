export async function GET(request) {
  try {
    // 요청 헤더에서 쿠키 가져오기
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      return Response.json({ user: null });
    }

    // 메인 사이트의 세션 확인 API에 쿠키 전달
    const response = await fetch('https://bluenote.site/api/auth/session-check', {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'X-Forwarded-Host': 'quiz.bluenote.site',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return Response.json({ user: null });
    }

    const data = await response.json();
    
    // 디버깅을 위한 로그
    console.log('[Quiz] Session check response:', {
      authenticated: data.authenticated,
      hasSession: !!data.session,
      hasUser: !!data.user
    });
    
    // 세션 데이터 반환 - 우선순위: data.user > data.session?.user
    const user = data.user || data.session?.user || null;
    
    return Response.json({
      user: user,
      authenticated: data.authenticated || !!user
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    return Response.json({ user: null });
  }
}