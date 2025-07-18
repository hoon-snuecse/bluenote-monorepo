import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // NextAuth 세션에서 사용자 정보 반환
    const user = {
      id: session.user.id || 'unknown',
      email: session.user.email,
      name: session.user.name,
      role: session.user.role || 'user',
      isAdmin: session.user.isAdmin,
      canWrite: session.user.canWrite,
      claudeDailyLimit: session.user.claudeDailyLimit,
    };
    
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}