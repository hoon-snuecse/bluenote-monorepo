import { NextResponse } from 'next/server';

export async function GET() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://grading.bluenote.site/api/auth/google/callback'
      : 'http://localhost:3000/api/auth/google/callback');

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    },
    computed: {
      redirectUri: redirectUri,
    },
    debug: 'Check these values in Vercel environment variables'
  });
}