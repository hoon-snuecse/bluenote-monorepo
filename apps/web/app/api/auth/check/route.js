import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    currentUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'local',
  });
}