import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // 관리자만 접근 가능한 경로
    const adminOnlyPaths = [
      '/admin',
      '/research/write',
      '/teaching/write', 
      '/analytics/write',
      '/shed/write'
    ];
    
    // 로그인만 필요한 경로 (모든 사용자)
    const authRequiredPaths = [
      '/ai/chat',
      '/auth/status',
      '/grading'  // submit 제외
    ];
    
    // 관리자 권한 체크
    const isAdminPath = adminOnlyPaths.some(adminPath => path.startsWith(adminPath));
    if (isAdminPath && !token?.isAdmin) {
      // 관리자가 아니면 unauthorized 페이지로 리다이렉트
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
    // grading 경로 (submit 제외)
    '/grading/((?!submit).*)',
    // API 경로 보호
    '/api/ai/:path*',
    '/api/admin/:path*',
    '/api/grading/((?!submit).*)'
  ],
};