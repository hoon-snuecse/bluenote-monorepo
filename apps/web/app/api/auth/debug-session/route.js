import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 환경 변수 확인
    const debug = {
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.headers.get('cookie'),
    };
    
    console.log('[NextAuth Debug]', debug);
    
    return NextResponse.json(debug);
  } catch (error) {
    console.error('[NextAuth Debug] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}