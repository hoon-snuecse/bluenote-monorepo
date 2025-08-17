// Removed next-auth import
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const session = user ? { user } : null;
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: {
          email: session.user?.email,
          name: session.user?.name,
          isAdmin: session.user?.isAdmin,
          canWrite: session.user?.canWrite,
          role: session.user?.role,
          claudeDailyLimit: session.user?.claudeDailyLimit
        }
      } : null,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
        NODE_ENV: process.env.NODE_ENV,
        hasSecret: !!process.env.NEXTAUTH_SECRET
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}