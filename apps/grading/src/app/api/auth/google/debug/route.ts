import { NextResponse } from 'next/server';

export async function GET() {
  const redirectUri = process.env.NODE_ENV === 'production' 
    ? process.env.GOOGLE_REDIRECT_URI || 'https://grading.bluenote.site/api/auth/google/callback'
    : process.env.GOOGLE_REDIRECT_URI_DEV || 'http://localhost:3001/api/auth/google/callback';

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      GOOGLE_REDIRECT_URI_DEV: process.env.GOOGLE_REDIRECT_URI_DEV,
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