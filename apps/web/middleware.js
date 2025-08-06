import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
  
  // Supabase 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
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
  
  // 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session) {
    const loginUrl = new URL('/auth/signin', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // 권한 정보 가져오기
  const email = session.user.email;
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('role, can_write')
    .eq('email', email)
    .single();
  
  const isAdmin = permissions?.role === 'admin';
  const canWrite = permissions?.can_write || false;
  
  // 관리자만 접근 가능한 경로
  if (path.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  
  // 글쓰기 권한이 필요한 경로
  const writePermissionPaths = [
    '/research/write',
    '/teaching/write', 
    '/analytics/write',
    '/shed/write'
  ];
  
  // 글쓰기 권한 체크 - 데이터베이스 기반으로만
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