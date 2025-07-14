import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromCookie, verifyToken } from '@/lib/auth';

// 보호된 경로 목록
const protectedPaths = [
  '/assignments',
  '/grading',
  '/student-report',
  '/settings',
  '/api/assignments',
  '/api/submissions',
  '/api/evaluations',
  '/api/settings',
  '/api/templates'
];

// 공개 경로 목록
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/submit', // 학생 제출 페이지
  '/view' // 토큰 기반 조회 페이지
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 공개 경로는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // 보호된 경로 확인
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // 토큰 확인
    const token = getTokenFromCookie(request.headers.get('cookie'));
    
    if (!token) {
      // 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // 토큰 검증
    const payload = verifyToken(token);
    
    if (!payload) {
      // 유효하지 않은 토큰 - 로그인 페이지로 리다이렉트
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
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