import { NextResponse } from 'next/server';
import { createServerClient } from '@bluenote/supabase-auth/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const callbackUrl = requestUrl.searchParams.get('callbackUrl') || '/';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // OAuth 에러 처리
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/auth/signin?error=${error}`, request.url));
  }

  if (code) {
    console.log('[Auth Callback] Processing OAuth code');
    
    // Use our package's createServerClient which has proper cookie options
    const supabase = createServerClient();

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
      
      // 리다이렉트 응답 생성
      const response = NextResponse.redirect(new URL(callbackUrl, request.url));
      
      return response;
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=UnexpectedError', request.url));
    }
  }

  // Return to sign in page with error
  return NextResponse.redirect(new URL('/auth/signin?error=NoCode', request.url));
}