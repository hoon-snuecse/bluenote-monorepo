import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { cookieHeader } = await request.json();
    
    console.log('[Quiz Server Sync] Starting server-side sync');
    
    // 서버 사이드에서 메인 사이트 세션 확인
    const response = await fetch('https://www.bluenote.site/api/auth/session', {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader || '',
        'Accept': 'application/json',
        'User-Agent': 'Quiz-App-Server-Sync',
      },
    });

    if (!response.ok) {
      console.log('[Quiz Server Sync] Failed to get session from main site');
      return NextResponse.json({ error: 'Failed to get session' }, { status: 401 });
    }

    const session = await response.json();
    
    if (!session || !session.user) {
      console.log('[Quiz Server Sync] No valid session found');
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    console.log('[Quiz Server Sync] Session found for user:', session.user.email);

    // Quiz 앱용 세션 쿠키 설정
    const cookieStore = cookies();
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
    console.error('[Quiz Server Sync] Error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}