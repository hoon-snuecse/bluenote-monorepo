import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const headersList = headers();
    const cookies = headersList.get('cookie');
    
    // Parse cookies
    const cookieObj = {};
    if (cookies) {
      cookies.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        cookieObj[key] = value;
      });
    }
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        email: session.user?.email,
        isAdmin: session.user?.isAdmin,
        canWrite: session.user?.canWrite,
        role: session.user?.role,
        claudeDailyLimit: session.user?.claudeDailyLimit
      } : null,
      cookies: {
        hasSessionToken: !!cookieObj['next-auth.session-token'],
        hasCallbackUrl: !!cookieObj['next-auth.callback-url'],
        hasCsrfToken: !!cookieObj['next-auth.csrf-token'],
        cookieNames: Object.keys(cookieObj).filter(k => k.includes('next-auth'))
      },
      headers: {
        host: headersList.get('host'),
        referer: headersList.get('referer'),
        userAgent: headersList.get('user-agent')
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}