import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('next-auth.session-token');
    
    return NextResponse.json({
      session: session || null,
      sessionCookie: sessionCookie ? {
        name: sessionCookie.name,
        value: sessionCookie.value ? 'EXISTS' : 'NO VALUE',
        path: sessionCookie.path,
        domain: sessionCookie.domain,
        secure: sessionCookie.secure,
        httpOnly: sessionCookie.httpOnly,
        sameSite: sessionCookie.sameSite,
        maxAge: sessionCookie.maxAge
      } : null,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV,
        hasSecret: !!process.env.NEXTAUTH_SECRET
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}