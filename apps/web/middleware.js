import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 쿠키 옵션 통합
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.VERCEL_ENV === 'production'
  return {
    domain: isProduction ? '.bluenote.site' : undefined,
    path: '/',
    sameSite: 'lax',
    secure: isProduction,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  
  // 보호된 경로 목록
  const protectedPaths = [
    '/admin',
    '/research/write',
    '/teaching/write',
    '/analytics/write',
    '/shed/write',
    '/ai/chat',
    '/auth/status',
    '/api/ai',
    '/api/admin'
  ];
  
  // 현재 경로가 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Supabase 클라이언트 생성 with proper cookie options
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: getCookieOptions(),
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // 미들웨어에서는 쿠키를 설정할 수 없음
        },
        remove(name, options) {
          // 미들웨어에서는 쿠키를 제거할 수 없음
        }
      }
    }
  );
  
  // 세션 확인
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[Middleware] Error getting session:', error);
  }
  
  // 디버그 로그
  console.log('[Middleware] Protected path:', path);
  console.log('[Middleware] Session:', session ? {
    email: session.user.email,
    userId: session.user.id
  } : 'No session');
  
  // 세션이 없으면 처리
  if (!session) {
    // API 경로는 401 응답 반환
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 일반 페이지는 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/auth/signin', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // 권한 정보 가져오기
  const email = session.user.email;
  
  // ADMIN_EMAILS 폴백 (하드코딩된 관리자 이메일)
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdminEmail = adminEmails.includes(email);
  
  // 데이터베이스 권한 체크 (RLS로 인해 실패할 수 있음)
  let isAdmin = isAdminEmail;
  let canWrite = isAdminEmail;
  
  try {
    const { data: permissions } = await supabase
      .from('user_permissions')
      .select('role, can_write')
      .eq('email', email)
      .single();
    
    if (permissions) {
      isAdmin = permissions.role === 'admin' || isAdminEmail;
      canWrite = permissions.can_write || isAdmin;
    }
  } catch (error) {
    console.log('[Middleware] Using fallback permissions for:', email);
  }
  
  // 관리자만 접근 가능한 경로
  if (path.startsWith('/admin') && !isAdmin) {
    // API 경로는 403 응답 반환
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // 일반 페이지는 unauthorized 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  
  // 글쓰기 권한이 필요한 경로
  const writePermissionPaths = [
    '/research/write',
    '/teaching/write', 
    '/analytics/write',
    '/shed/write'
  ];
  
  // 글쓰기 권한 체크 - ADMIN_EMAILS 폴백 포함
  const isWritePath = writePermissionPaths.some(writePath => path.startsWith(writePath));
  if (isWritePath && !isAdmin && !canWrite) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  
  return NextResponse.next();
}

// 보호된 경로 설정
export const config = {
  matcher: [
    // 관리자 전용 경로
    '/admin/:path*',
    '/research/write',
    '/teaching/write',
    '/analytics/write',
    '/shed/write',
    // 로그인 필요 경로
    '/ai/chat/:path*',
    '/auth/status/:path*',
    // API 경로 보호
    '/api/ai/:path*',
    '/api/admin/:path*'
  ],
};