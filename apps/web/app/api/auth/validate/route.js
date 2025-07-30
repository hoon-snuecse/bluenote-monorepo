import { getServerSession } from 'next-auth/next';
import { createAuthOptions } from '@bluenote/auth';

const authOptions = createAuthOptions();
import { NextResponse } from 'next/server';

// 다른 앱에서 세션 유효성을 검증하기 위한 엔드포인트
export async function POST(request) {
  try {
    // CORS 헤더 설정
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://grading.bluenote.site',
      'https://quiz.bluenote.site',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003'
    ];

    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }

    // 세션 토큰 가져오기
    const { sessionToken } = await request.json();
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      );
    }

    // 현재 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      );
    }

    // 세션 정보 반환
    return NextResponse.json(
      { 
        authenticated: true,
        session: {
          user: session.user,
          expires: session.expires
        }
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    );
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://grading.bluenote.site',
    'https://quiz.bluenote.site',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  return new NextResponse(null, { status: 403 });
}