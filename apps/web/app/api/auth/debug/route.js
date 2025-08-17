// Removed next-auth import
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const session = user ? { user } : null;
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