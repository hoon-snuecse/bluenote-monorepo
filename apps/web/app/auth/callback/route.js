import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const callbackUrl = requestUrl.searchParams.get('callbackUrl') || '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            const isProduction = process.env.NODE_ENV === 'production' || 
                               process.env.VERCEL_ENV === 'production';
            cookieStore.set({
              name,
              value,
              ...options,
              domain: isProduction ? '.bluenote.site' : undefined,
              path: '/',
              sameSite: 'lax',
              secure: isProduction,
              httpOnly: false,
              maxAge: 60 * 60 * 24 * 7 // 7 days
            });
          },
          remove(name, options) {
            const isProduction = process.env.NODE_ENV === 'production' || 
                               process.env.VERCEL_ENV === 'production';
            cookieStore.set({
              name,
              value: '',
              ...options,
              domain: isProduction ? '.bluenote.site' : undefined,
              path: '/',
              sameSite: 'lax',
              secure: isProduction,
              httpOnly: false,
              maxAge: 0
            });
          }
        }
      }
    );

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