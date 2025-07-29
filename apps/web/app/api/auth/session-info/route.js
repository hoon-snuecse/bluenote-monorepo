import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// 현재 세션 정보를 반환하는 엔드포인트 (CORS 지원)
export async function GET(request) {
  try {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://grading.bluenote.site',
      'https://quiz.bluenote.site',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003'
    ];

    // CORS 검증
    const corsHeaders = {};
    if (origin && allowedOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    // 세션 가져오기
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { 
          authenticated: false,
          session: null 
        },
        { 
          status: 200,
          headers: corsHeaders
        }
      );
    }

    // 세션 정보 반환
    return NextResponse.json(
      { 
        authenticated: true,
        session: {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
            role: session.user.role
          },
          expires: session.expires
        }
      },
      { 
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Session info error:', error);
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  return new NextResponse(null, { status: 403 });
}