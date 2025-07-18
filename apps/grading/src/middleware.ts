import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 보호된 경로 목록
const protectedPaths = [
  '/assignments',
  '/grading',
  '/student-report',
  '/settings',
  '/dashboard',
  '/dashboard-beta',
  '/api/assignments',
  '/api/submissions',
  '/api/evaluations',
  '/api/settings',
  '/api/templates',
  '/api/users/sync',
];

// 공개 경로 목록
const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/error',
  '/api/auth',
  '/submit', // 학생 제출 페이지
  '/view', // 토큰 기반 조회 페이지
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 공개 경로는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // 정적 파일은 통과
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }
  
  // 보호된 경로 확인
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // NextAuth 토큰 확인
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      // 로그인 페이지로 리다이렉트
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // 인증된 사용자 - 요청 통과
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};