import { NextResponse } from 'next/server'
import { createServerClient } from '@bluenote/supabase-auth/middleware'

// 인증이 필요없는 공개 경로들
const publicPaths = [
  '/',
  '/auth',
  '/api/auth',
  '/api/health',
  '/_next',
  '/favicon.ico',
  // 커뮤니티는 공개 접근 가능
  '/community',
  '/api/share/quiz', // 퀴즈 공유 API
  '/debug-auth', // 디버그 페이지
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
  
  console.log('[Middleware] Processing path:', pathname)
  
  // auth callback은 항상 통과
  if (pathname === '/auth/callback' || pathname === '/auth/google') {
    return NextResponse.next()
  }
  
  // public 경로는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    // response 객체 생성
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    
    // Supabase Auth 세션 확인
    const supabase = createServerClient(request, response)
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('[Middleware] Session check:', { path: pathname, hasSession: !!session, error })
    
    // 세션이 없으면 로그인 페이지로 리다이렉트
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    
    // 세션이 있으면 response 반환 (쿠키 업데이트 포함)
    return supabase._response || response
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