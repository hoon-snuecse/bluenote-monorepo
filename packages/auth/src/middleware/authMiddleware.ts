import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface AuthMiddlewareOptions {
  mainAuthUrl?: string;
  publicPaths?: string[];
  redirectToMain?: boolean;
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    mainAuthUrl = process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'https://bluenote.site',
    publicPaths = ['/api/auth', '/auth', '/_next', '/favicon.ico'],
    redirectToMain = true
  } = options;

  return async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public paths는 인증 불필요
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // 로컬 세션 확인
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    // 세션이 없으면
    if (!token) {
      // API 요청인 경우 401 반환
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // 메인 앱으로 리다이렉트
      if (redirectToMain) {
        const callbackUrl = request.url;
        const signInUrl = new URL(`${mainAuthUrl}/api/auth/signin`);
        signInUrl.searchParams.set('callbackUrl', callbackUrl);
        
        return NextResponse.redirect(signInUrl);
      }

      // 로컬 로그인 페이지로 리다이렉트
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 세션이 있으면 계속 진행
    return NextResponse.next();
  };
}