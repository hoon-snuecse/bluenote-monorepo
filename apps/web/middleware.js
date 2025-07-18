import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // 디버그 로그
    console.log('[Middleware] Path:', path);
    console.log('[Middleware] Token:', {
      email: token?.email,
      isAdmin: token?.isAdmin,
      canWrite: token?.canWrite
    });
    
    // 관리자만 접근 가능한 경로
    const adminOnlyPaths = [
      '/admin'
    ];
    
    // 글쓰기 권한이 필요한 경로 (관리자 또는 can_write 권한)
    const writePermissionPaths = [
      '/research/write',
      '/teaching/write', 
      '/analytics/write',
      '/shed/write'
    ];
    
    // 로그인만 필요한 경로 (모든 사용자)
    const authRequiredPaths = [
      '/ai/chat',
      '/auth/status'
    ];
    
    // 관리자 권한 체크
    const isAdminPath = adminOnlyPaths.some(adminPath => path.startsWith(adminPath));
    if (isAdminPath && !token?.isAdmin) {
      // 관리자가 아니면 unauthorized 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    // 임시 관리자 이메일 체크
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
    const isAdminEmail = token?.email && adminEmails.includes(token.email);
    
    // 글쓰기 권한 체크
    const isWritePath = writePermissionPaths.some(writePath => path.startsWith(writePath));
    if (isWritePath && !token?.isAdmin && !token?.canWrite && !isAdminEmail) {
      // 글쓰기 권한이 없으면 unauthorized 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    // 인증된 사용자는 모두 통과
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
      error: '/auth/error',
    }
  }
);

// 보호된 경로 설정
export const config = {
  matcher: [
    // 관리자 전용 경로
    '/admin/:path*',
    '/research/write/:path*',
    '/teaching/write/:path*',
    '/analytics/write/:path*',
    '/shed/write/:path*',
    // 로그인 필요 경로
    '/ai/chat/:path*',
    '/auth/status/:path*',
    // API 경로 보호
    '/api/ai/:path*',
    '/api/admin/:path*'
  ],
};