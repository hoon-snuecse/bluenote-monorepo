import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 간단한 테스트 응답
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: session.user.email,
      message: 'Test analytics endpoint working'
    });

  } catch (error) {
    console.error('Test Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}