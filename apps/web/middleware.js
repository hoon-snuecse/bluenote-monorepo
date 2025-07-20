import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
  
  // JWT 토큰 가져오기
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token'
  });
  
  // 디버그 로그
  console.log('[Middleware] Protected path:', path);
  console.log('[Middleware] Token:', token ? {
    email: token.email,
    isAdmin: token.isAdmin,
    canWrite: token.canWrite,
    exp: token.exp
  } : 'No token');
  
  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    const loginUrl = new URL('/auth/signin', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // 관리자만 접근 가능한 경로
  if (path.startsWith('/admin') && !token.isAdmin) {
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
  if (isWritePath && !token.isAdmin && !token.canWrite) {
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