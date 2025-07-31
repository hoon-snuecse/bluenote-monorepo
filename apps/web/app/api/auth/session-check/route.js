import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function OPTIONS(request) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://quiz.bluenote.site',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie, X-Forwarded-Host',
  };
  
  return new NextResponse(null, { status: 200, headers });
}

export async function GET(request) {
  try {
    // CORS를 위한 헤더 설정
    const headers = {
      'Access-Control-Allow-Origin': 'https://quiz.bluenote.site',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie, X-Forwarded-Host',
    };

    // OPTIONS 요청 처리
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers });
    }

    const session = await getServerSession(authOptions);
    
    // 디버깅을 위한 로그
    const forwardedHost = request.headers.get('X-Forwarded-Host');
    console.log('[Main] Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      requestFrom: forwardedHost || 'direct'
    });
    
    return NextResponse.json({
      authenticated: !!session,
      session: session,
      user: session?.user || null,
    }, { headers });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error.message,
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://quiz.bluenote.site',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }
}