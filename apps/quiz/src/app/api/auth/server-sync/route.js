import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    
    // 서버 사이드에서 쿠키 가져오기
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('next-auth.session-token');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }
    
    // 메인 사이트 세션 확인
    const response = await fetch('https://www.bluenote.site/api/auth/session', {
      method: 'GET',
      headers: {
        'Cookie': `next-auth.session-token=${sessionToken.value}`,
        'Accept': 'application/json',
        'User-Agent': 'Quiz-App-Server-Sync',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to get session' }, { status: 401 });
    }

    const session = await response.json();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }


    // Quiz 앱용 세션 쿠키 설정
    const isProduction = process.env.NODE_ENV === 'production';
    
    // 세션 데이터를 JSON으로 인코딩
    const sessionCookie = Buffer.from(JSON.stringify({
      user: session.user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24시간
    })).toString('base64');

    // Quiz 앱 전용 세션 쿠키 설정
    cookieStore.set('quiz-session', sessionCookie, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24시간
      // Quiz 앱 도메인에만 설정
      domain: isProduction ? 'quiz.bluenote.site' : undefined
    });

    return NextResponse.json({
      success: true,
      user: session.user
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}