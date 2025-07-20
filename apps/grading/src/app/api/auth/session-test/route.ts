import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get session
    const session = await getServerSession();
    
    // Get all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Check for session token
    const sessionToken = cookieStore.get('next-auth.session-token');
    const sessionTokenSecure = cookieStore.get('__Secure-next-auth.session-token');
    
    return NextResponse.json({
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      cookies: {
        count: allCookies.length,
        sessionToken: sessionToken ? 'Found' : 'Not found',
        sessionTokenSecure: sessionTokenSecure ? 'Found' : 'Not found',
        allCookieNames: allCookies.map(c => c.name)
      },
      environment: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV,
        domain: new URL(process.env.NEXTAUTH_URL || 'http://localhost').hostname
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Session test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}