import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createAuthOptions } from '@bluenote/auth';

export async function GET(request: Request) {
  const session = await getServerSession(createAuthOptions());
  
  // 쿠키 정보 확인
  const cookies = request.headers.get('cookie') || '';
  const sessionTokenExists = cookies.includes('authjs.session-token');
  const csrfTokenExists = cookies.includes('authjs.csrf-token');
  
  return NextResponse.json({
    session: session ? {
      user: session.user?.email,
      isAuthenticated: true
    } : null,
    cookies: {
      sessionToken: sessionTokenExists,
      csrfToken: csrfTokenExists,
      allCookies: process.env.NODE_ENV === 'development' ? cookies : 'hidden'
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Not Set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Not Set',
    }
  });
}