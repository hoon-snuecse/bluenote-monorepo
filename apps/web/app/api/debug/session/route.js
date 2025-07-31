import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
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
      isAdminEmail: session?.user?.email ? adminEmails.includes(session.user.email) : false,
      adminEmails: adminEmails.map(email => email.replace(/^(.{2}).*@/, '$1***@')),
      authDebug: {
        hasSession: !!session,
        hasIsAdmin: session?.user?.isAdmin,
        hasCanWrite: session?.user?.canWrite,
        claudeDailyLimit: session?.user?.claudeDailyLimit,
        userRole: session?.user?.role
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}