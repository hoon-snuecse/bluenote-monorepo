import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 디버깅을 위한 로그
  console.log('Middleware - pathname:', pathname)
  
  // 인증이 필요없는 경로
  const publicPaths = ['/auth/signin', '/auth/error', '/api/auth', '/api/health', '/auth/check-web-session']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  // 루트 경로 처리 - 세션 체크 후 리다이렉트는 page.js에서 처리
  if (pathname === '/') {
    return NextResponse.next()
  }

  // 보호된 경로 체크
  const protectedPaths = ['/create', '/my-quizzes', '/community', '/api/quizzes', '/api/ai', '/api/export', '/api/share']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    try {
      // 쿠키 이름을 명시적으로 지정
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: 'next-auth.session-token'
      })
      
      console.log('Middleware - pathname:', pathname, 'token:', !!token)

      if (!token) {
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
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