import { NextRequest, NextResponse } from 'next/server'

// 세션 확인이 필요없는 경로들
const publicPaths = [
  '/auth/signin',
  '/auth/error',
  '/auth/sync',
  '/api/auth',
  '/api/health',
  '/debug/session',
  '/_next',
  '/favicon.ico'
]

export async function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // public 경로는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // 메인 페이지는 통과
  if (pathname === '/') {
    return NextResponse.next()
  }
  
  // 보호된 경로 체크 (Quiz 앱의 주요 기능들)
  const protectedPaths = ['/create', '/my-quizzes', '/community']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    // 세션 쿠키 확인 - 다양한 가능한 쿠키 이름들 체크
    const possibleSessionTokenNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.session-token'
    ]
    
    let sessionToken = null
    for (const name of possibleSessionTokenNames) {
      const token = request.cookies.get(name)
      if (token) {
        sessionToken = token
        break
      }
    }
    
    // 디버깅용 로그 - 모든 쿠키 출력
    const allCookies = request.cookies.getAll()
    console.log('[Quiz Middleware] Path:', pathname)
    console.log('[Quiz Middleware] Environment:', process.env.NODE_ENV)
    console.log('[Quiz Middleware] Session token found:', sessionToken ? `Yes (${sessionToken.name})` : 'No')
    console.log('[Quiz Middleware] All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // 세션이 없으면 로그인 페이지로
    if (!sessionToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      console.log('[Quiz Middleware] No session, redirecting to signin')
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

// TODO: Edge Runtime 호환성 문제 해결 후 createAuthMiddleware 사용
// import { createAuthMiddleware } from '@bluenote/auth'
// export const middleware = createAuthMiddleware({
//   mainAuthUrl: process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'http://localhost:3000',
//   publicPaths: [
//     '/auth/signin', 
//     '/auth/error', 
//     '/api/auth', 
//     '/api/health', 
//     '/auth/check-web-session', 
//     '/api/debug', 
//     '/auth/sync-session',
//     '/_next',
//     '/favicon.ico'
//   ],
//   redirectToMain: true
// })

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