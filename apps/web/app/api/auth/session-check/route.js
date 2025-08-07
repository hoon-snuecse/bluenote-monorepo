import { createServerClient } from '@bluenote/supabase-auth/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function OPTIONS(request) {
  // 개발 환경과 프로덕션 환경에서 모두 지원
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://quiz.bluenote.site',
    'http://localhost:3003',
    'http://127.0.0.1:3003'
  ];
  
  const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://quiz.bluenote.site';
  
  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie, X-Forwarded-Host',
  };
  
  return new NextResponse(null, { status: 200, headers });
}

export async function GET(request) {
  try {
    // CORS를 위한 헤더 설정
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://quiz.bluenote.site',
      'http://localhost:3003',
      'http://127.0.0.1:3003'
    ];
    
    const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://quiz.bluenote.site';
    
    const headers = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie, X-Forwarded-Host',
    };

    // OPTIONS 요청 처리
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers });
    }

    // Supabase 서버 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    // Supabase 세션 확인
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // 디버깅을 위한 로그
    const forwardedHost = request.headers.get('X-Forwarded-Host');
    console.log('[Supabase] Session check:', {
      hasUser: !!user,
      userEmail: user?.email,
      requestFrom: forwardedHost || 'direct',
      error: error?.message
    });
    
    return NextResponse.json({
      authenticated: !!user,
      session: user ? { user } : null,
      user: user || null,
    }, { headers });
  } catch (error) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://quiz.bluenote.site',
      'http://localhost:3003',
      'http://127.0.0.1:3003'
    ];
    
    const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://quiz.bluenote.site';
    
    return NextResponse.json({
      authenticated: false,
      error: error.message,
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }
}