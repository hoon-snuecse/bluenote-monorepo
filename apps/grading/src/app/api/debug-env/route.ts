import { NextResponse } from 'next/server';

export async function GET() {
  // 프로덕션에서는 민감한 정보를 숨김
  const isProduction = process.env.NODE_ENV === 'production';
  
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Not Set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Not Set',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Not Set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Not Set',
    // 개발 환경에서만 실제 URL 표시
    ACTUAL_URL: !isProduction ? process.env.NEXTAUTH_URL : 'hidden',
  });
}