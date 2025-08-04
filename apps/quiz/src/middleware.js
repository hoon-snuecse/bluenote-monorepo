import { NextResponse } from 'next/server'

// 인증이 필요없는 공개 경로들
const publicPaths = [
  '/',
  '/auth',
  '/signin',
  '/error',
  '/api/auth',
  '/api/health',
  '/_next',
  '/favicon.ico',
  // 커뮤니티는 공개 접근 가능
  '/community',
]

export async function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // public 경로는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // 나머지 경로도 일단 통과 (NextAuth SessionProvider가 처리)
  return NextResponse.next()
}

// 미들웨어를 적용할 경로
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}