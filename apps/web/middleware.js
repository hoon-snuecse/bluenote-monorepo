import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // 관리자만 접근 가능한 경로
    const adminPaths = [
      '/ai/chat', 
      '/admin',
      '/research/write',
      '/teaching/write', 
      '/analytics/write',
      '/shed/write'
    ];
    const isAdminPath = adminPaths.some(path => req.nextUrl.pathname.startsWith(path));
    
    // 관리자 경로이고 관리자가 아닌 경우
    if (isAdminPath && !req.nextauth.token?.isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// 보호된 경로 설정
export const config = {
  matcher: [
    '/ai/chat/:path*', 
    '/admin/:path*',
    '/research/write/:path*',
    '/teaching/write/:path*',
    '/analytics/write/:path*',
    '/shed/write/:path*'
  ],
};