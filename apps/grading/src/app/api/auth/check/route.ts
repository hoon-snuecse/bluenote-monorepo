import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createAuthOptions } from '@bluenote/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(createAuthOptions());
    
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