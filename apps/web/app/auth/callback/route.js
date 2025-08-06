import { NextResponse } from 'next/server';
import { createServerClient } from '@bluenote/supabase-auth/server';
import { cookies } from 'next/headers';

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
    // Use our package's createServerClient which has proper cookie options
    const supabase = createServerClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.session) {
      // 권한 체크
      const email = data.session.user.email;
      const { checkUserPermission } = await import('@/lib/auth');
      const isAllowed = await checkUserPermission(email);
      
      if (!isAllowed) {
        console.log(`[Auth Callback] Access denied for ${email} - not in allowed users`);
        // 세션 삭제
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/auth/signin?error=AccessDenied', request.url));
      }
      
      console.log('[Auth Callback] Successfully authenticated:', email);
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
  }

  // Return to sign in page with error
  return NextResponse.redirect(new URL('/auth/signin?error=AuthenticationFailed', request.url));
}