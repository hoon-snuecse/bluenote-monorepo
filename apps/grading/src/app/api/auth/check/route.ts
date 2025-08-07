import { NextResponse } from 'next/server';
import { getSessionWithPermissions } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  console.log('[Auth Check] Checking session...');
  
  try {
    const session = await getSessionWithPermissions();
    console.log('[Auth Check] Session:', session ? 'Found' : 'Not found');
    
    return NextResponse.json({
      authenticated: !!session,
      user: session?.user?.email || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check session',
      timestamp: new Date().toISOString()
    });
  }
}