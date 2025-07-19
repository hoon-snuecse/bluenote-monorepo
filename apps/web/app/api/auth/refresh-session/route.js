import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }
    
    // NextAuth doesn't have a built-in way to refresh session
    // The best approach is to ask user to sign out and sign in again
    return NextResponse.json({
      message: 'Please sign out and sign in again to refresh your permissions',
      currentSession: {
        email: session.user.email,
        isAdmin: session.user.isAdmin,
        canWrite: session.user.canWrite
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}