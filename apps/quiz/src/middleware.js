import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 디버깅을 위한 로그
  console.log('Middleware - pathname:', pathname)
  
  // 인증이 필요없는 경로
  const publicPaths = ['/auth/signin', '/auth/error', '/api/auth', '/api/health', '/auth/check-web-session', '/api/auth/debug-cookies', '/auth/sync-session']
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
      // Vercel 프로덕션 환경에서는 보안 쿠키 이름 사용
      const isProduction = process.env.VERCEL_ENV === 'production' || 
                          process.env.NODE_ENV === 'production'
      
      // 여러 쿠키 이름을 시도
      const cookieNames = isProduction 
        ? ['__Secure-next-auth.session-token', 'next-auth.session-token']
        : ['next-auth.session-token', '__Secure-next-auth.session-token']
      
      let token = null
      
      // 각 쿠키 이름으로 토큰 확인
      for (const cookieName of cookieNames) {
        try {
          token = await getToken({ 
            req: request, 
            secret: process.env.NEXTAUTH_SECRET,
            cookieName
          })
          
          if (token) {
            console.log('Middleware - found token with cookie:', cookieName)
            break
          }
        } catch (err) {
          // 이 쿠키로는 실패, 다음 시도
          console.log('Middleware - failed to get token with cookie:', cookieName)
        }
      }
      
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