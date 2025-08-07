import { createServerClient } from '@bluenote/supabase-auth/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerClient();
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 성공적으로 로그인한 경우 리다이렉트
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // 에러가 발생한 경우 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}