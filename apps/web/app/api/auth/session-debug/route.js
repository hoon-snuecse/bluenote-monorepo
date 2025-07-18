import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }
    
    return NextResponse.json({
      session: {
        user: {
          email: session.user.email,
          name: session.user.name,
          isAdmin: session.user.isAdmin,
          canWrite: session.user.canWrite,
          id: session.user.id
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}