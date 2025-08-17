import { createServerClient } from '@bluenote/supabase-auth/server';
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
    const supabase = await createServerClient();
    
    // Supabase 세션 확인
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // 권한 정보 가져오기
    let permissions = null;
    let isAdmin = false;
    let canWrite = false;
    
    if (user?.email) {
      const { data: permData } = await supabase
        .from('user_permissions')
        .select('role, can_write, claude_daily_limit')
        .eq('email', user.email)
        .single();
      
      permissions = permData;
      
      // ADMIN_EMAILS 폴백
      const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
      isAdmin = permData?.role === 'admin' || adminEmails.includes(user.email);
      canWrite = permData?.can_write || isAdmin;
    }
    
    // 디버깅을 위한 로그
    const forwardedHost = request.headers.get('X-Forwarded-Host');
    console.log('[Supabase] Session check:', {
      hasUser: !!user,
      userEmail: user?.email,
      isAdmin,
      canWrite,
      permissions,
      requestFrom: forwardedHost || 'direct',
      error: error?.message
    });
    
    // 권한이 포함된 사용자 객체 생성
    const enrichedUser = user ? {
      ...user,
      isAdmin,
      canWrite,
      permissions
    } : null;
    
    return NextResponse.json({
      authenticated: !!user,
      session: enrichedUser ? { user: enrichedUser } : null,
      user: enrichedUser,
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