import { NextResponse } from 'next/server'
import { createServerClient } from '@bluenote/supabase-auth/middleware'

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
  '/my-quizzes',
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
    // response 객체 생성
    const response = NextResponse.next()
    
    // Supabase Auth 세션 확인
    const supabase = createServerClient(request, response)
    const { data: { session } } = await supabase.auth.getSession()
    
    // 세션이 없으면 로그인 페이지로 리다이렉트
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    
    return response
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