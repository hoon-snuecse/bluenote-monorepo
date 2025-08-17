import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';

export async function GET(request) {
  try {
    // Get session using Supabase auth
    const supabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    const session = user ? { user } : null;
    
    // Get user permissions from database
    let dbPermissions = null;
    if (session?.user?.email) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('email', session.user.email)
        .single();
      
      if (!error && data) {
        dbPermissions = data;
      }
    }
    
    // Get admin emails from env
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    
    return NextResponse.json({
      session: session ? {
        user: {
          ...session.user,
          // Mask sensitive data
          id: session.user.id ? '***' + session.user.id.slice(-4) : null
        }
      } : null,
      dbPermissions,
      isAdminEmail: user?.email ? adminEmails.includes(user.email) : false,
      adminEmails: adminEmails.map(email => email.replace(/^(.{2}).*@/, '$1***@')),
      authDebug: {
        hasSession: !!session,
        hasIsAdmin: user?.user_metadata?.isAdmin,
        hasCanWrite: user?.user_metadata?.canWrite,
        claudeDailyLimit: user?.user_metadata?.claudeDailyLimit,
        userRole: user?.user_metadata?.role
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}