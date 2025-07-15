import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 원래 callback 라우트로 리다이렉트
  const url = new URL(request.url);
  const newUrl = new URL('/api/auth/google/callback', url.origin);
  
  // 모든 쿼리 파라미터 복사
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  return NextResponse.redirect(newUrl);
}