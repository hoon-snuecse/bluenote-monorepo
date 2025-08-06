import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Supabase 세션 가져오기
    const session = await getServerSession();
    
    // 디버깅 로그
    console.log('[Web Session API] Session:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    // NextAuth 형식으로 변환하여 반환 (기존 코드 호환성 유지)
    if (session) {
      return NextResponse.json({
        user: {
          email: session.user.email,
          id: session.user.id,
          ...session.user.permissions
        },
        expires: new Date(session.expires_at * 1000).toISOString()
      });
    }
    
    return NextResponse.json({});
  } catch (error) {
    console.error('[Web Session API] Error:', error);
    return NextResponse.json({}, { status: 500 });
  }
}