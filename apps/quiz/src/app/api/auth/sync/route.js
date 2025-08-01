import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { syncToken } = await request.json();
    
    if (!syncToken) {
      return NextResponse.json({ error: 'Sync token required' }, { status: 400 });
    }

    // Web 앱의 session-sync 엔드포인트 호출
    const response = await fetch('https://www.bluenote.site/api/auth/session-sync?token=' + syncToken, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Invalid sync token' }, { status: 401 });
    }

    const sessionData = await response.json();

    // Quiz 앱용 세션 쿠키 설정
    const cookieStore = cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    // 세션 데이터를 JSON으로 인코딩
    const sessionCookie = Buffer.from(JSON.stringify({
      user: sessionData.user,
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
      user: sessionData.user
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // 세션 쿠키 삭제
    const cookieStore = cookies();
    cookieStore.delete('quiz-session');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}