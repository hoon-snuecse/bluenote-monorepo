import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const callbackUrl = requestUrl.searchParams.get('callbackUrl') || '/';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('[Auth Callback] Request URL:', request.url);
  console.log('[Auth Callback] Code:', code ? 'Present' : 'None');
  console.log('[Auth Callback] CallbackUrl:', callbackUrl);

  // OAuth 에러 처리
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/auth/signin?error=${error}`, request.url));
  }

  if (code) {
    console.log('[Auth Callback] Processing OAuth code');
    
    // Cookie 옵션 설정 - Next.js 15에서는 await 필요
    const cookieStore = await cookies();
    const getCookieOptions = () => {
      const isProduction = process.env.NODE_ENV === 'production' || 
                          process.env.VERCEL_ENV === 'production';
      return {
        domain: isProduction ? '.bluenote.site' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: isProduction,
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7 // 7 days
      };
    };
    
    // 직접 Supabase 클라이언트 생성
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          async get(name) {
            const cookie = await cookieStore.get(name);
            return cookie?.value;
          },
          async set(name, value, options) {
            try {
              const finalOptions = { ...getCookieOptions(), ...options };
              console.log(`[Auth Callback] Setting cookie ${name} with options:`, finalOptions);
              await cookieStore.set(name, value, finalOptions);
            } catch (error) {
              console.error(`[Auth Callback] Error setting cookie ${name}:`, error);
            }
          },
          async remove(name, options) {
            try {
              const finalOptions = { ...getCookieOptions(), ...options };
              await cookieStore.set(name, '', { ...finalOptions, maxAge: 0 });
            } catch (error) {
              console.error(`[Auth Callback] Error removing cookie ${name}:`, error);
            }
          },
        },
        cookieOptions: getCookieOptions()
      }
    );

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('[Auth Callback] Error exchanging code:', exchangeError);
        return NextResponse.redirect(new URL('/auth/signin?error=CodeExchangeFailed', request.url));
      }
      
      if (!data?.session) {
        console.error('[Auth Callback] No session returned from code exchange');
        return NextResponse.redirect(new URL('/auth/signin?error=NoSession', request.url));
      }

      // 권한 체크
      const email = data.session.user.email;
      console.log('[Auth Callback] Checking permissions for:', email);
      
      const { checkUserPermission } = await import('@/lib/auth');
      const isAllowed = await checkUserPermission(email);
      
      if (!isAllowed) {
        console.log(`[Auth Callback] Access denied for ${email} - not in allowed users`);
        // 세션 삭제
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/auth/signin?error=AccessDenied', request.url));
      }
      
      console.log('[Auth Callback] Successfully authenticated:', email);
      
      // 쿠키가 제대로 설정되었는지 확인하기 위해 세션을 다시 가져옴
      const { data: { session: verifySession } } = await supabase.auth.getSession();
      console.log('[Auth Callback] Session verification:', verifySession ? 'Session exists' : 'No session');
      
      // 리다이렉트 응답 생성 - 절대 URL 사용
      const redirectUrl = new URL(callbackUrl, request.url);
      console.log('[Auth Callback] Redirecting to:', redirectUrl.toString());
      
      const response = NextResponse.redirect(redirectUrl);
      
      // Supabase 세션 쿠키를 수동으로 응답 헤더에 추가
      // 이는 Route Handler에서 쿠키를 확실하게 설정하기 위함
      const cookieOptions = getCookieOptions();
      const allCookies = await cookieStore.getAll();
      
      for (const cookie of allCookies) {
        if (cookie.name.startsWith('sb-')) {
          response.cookies.set(cookie.name, cookie.value, cookieOptions);
        }
      }
      
      // 응답 헤더 로깅
      console.log('[Auth Callback] Response headers:', response.headers);
      
      return response;
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=UnexpectedError', request.url));
    }
  }

  // Return to sign in page with error
  return NextResponse.redirect(new URL('/auth/signin?error=NoCode', request.url));
}