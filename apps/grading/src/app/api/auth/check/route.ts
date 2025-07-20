import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function GET(request: Request) {
  console.log('[Auth Check] Checking session...');
  
  try {
    const session = await getServerSession();
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