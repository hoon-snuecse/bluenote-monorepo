import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    // Get admin emails from env
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    
    return NextResponse.json({
      hasSession: !!session,
      userEmail: session?.user?.email || 'No session',
      isAdmin: session?.user?.isAdmin || false,
      canWrite: session?.user?.canWrite || false,
      role: session?.user?.role || 'No role',
      isInAdminEmails: session?.user?.email ? adminEmails.includes(session.user.email) : false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}