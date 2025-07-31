import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // NextAuth 세션 가져오기
    const session = await getServerSession(authOptions);
    
    // 디버깅 로그
    console.log('[Web Session API] Session:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    // NextAuth 형식으로 반환
    return NextResponse.json(session || {});
  } catch (error) {
    console.error('[Web Session API] Error:', error);
    return NextResponse.json({}, { status: 500 });
  }
}