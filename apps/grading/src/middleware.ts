import { NextRequest, NextResponse } from 'next/server';

// 임시로 미들웨어를 간단하게 구현 (Edge Runtime 에러 해결을 위해)
export function middleware(request: NextRequest) {
  // 모든 요청을 통과시킴
  return NextResponse.next();
}

// TODO: Edge Runtime 호환성 문제 해결 후 createAuthMiddleware 사용
// import { createAuthMiddleware } from '@bluenote/auth';
// export const middleware = createAuthMiddleware({
//   mainAuthUrl: process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'http://localhost:3000',
//   publicPaths: [
//     '/',
//     '/auth/signin',
//     '/auth/error',
//     '/api/auth',
//     '/submit',
//     '/view',
//     '/api/health',
//     '/public-submissions',
//     '/_next',
//     '/favicon.ico'
//   ],
//   redirectToMain: true
// });

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