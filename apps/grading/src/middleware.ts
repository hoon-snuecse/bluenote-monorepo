import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@bluenote/supabase-auth/server'

// 인증이 필요하지 않은 공개 경로들
const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/error',
  '/auth/callback',
  '/api/auth/callback',
  '/api/health',
  '/api/check-env',
  '/api/public',        // 모든 public API 경로 허용
  '/api/submissions',   // 학생 제출용 API
  '/api/lm-studio',     // LM Studio API 경로
  '/api/test-lm-studio', // LM Studio 테스트 API
  '/test-lm-studio',    // LM Studio 테스트 페이지
  '/submit',
  '/view',
  '/public-submissions',
  '/test-auth',
  '/test-api-security',
  '/api/test-secured',
  '/api/test-middleware',
  '/_next',
  '/favicon.ico'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 공개 경로는 인증 체크 없이 통과
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  )
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  try {
    // Supabase 세션 체크
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // user_permissions 체크 (선택사항)
    // API 라우트에서 더 세밀한 권한 체크를 수행하므로
    // 미들웨어에서는 기본 인증만 체크
    
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware auth error:', error)
    // 에러 발생 시 일단 통과 (API 레벨에서 다시 체크)
    return NextResponse.next()
  }
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
}