import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      authenticated: !!session,
      session: session,
      user: session?.user || null,
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error.message,
    });
  }
}