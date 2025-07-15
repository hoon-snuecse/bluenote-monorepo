import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'This is grading app',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    }
  });
}