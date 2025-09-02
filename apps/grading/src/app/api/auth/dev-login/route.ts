import { NextResponse } from 'next/server';

export async function GET() {
  // Development auto-login endpoint
  // This is only used in development environment for convenience
  
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  // In development, we don't need to do anything special
  // The user is already logged in via Supabase Auth
  return NextResponse.json({
    success: true,
    message: 'Dev login endpoint - user already authenticated via Supabase'
  });
}