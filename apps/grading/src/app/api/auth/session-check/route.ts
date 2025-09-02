import { NextResponse } from 'next/server';
import { getSessionWithPermissions } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const session = await getSessionWithPermissions();
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false 
      }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Session check failed' 
    }, { status: 500 });
  }
}