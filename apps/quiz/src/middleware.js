import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

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
  '/api/share/quiz', // 퀴즈 공유 API
]

// 인증이 필요한 경로들
const protectedPaths = [
  '/create',
  '/saved',
  '/api/quizzes',
  '/api/ai',
  '/api/export',
]

export async function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // public 경로는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    // NextAuth JWT 토큰 확인
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      // @bluenote/auth 공유 세션 쿠키 이름
      cookieName: 'next-auth.session-token'
    })
    
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }
  
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