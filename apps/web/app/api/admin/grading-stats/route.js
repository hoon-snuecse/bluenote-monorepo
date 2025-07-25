import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    // Grading 앱의 통계 API 호출
    let gradingStats = {
      evaluations: {
        byModel: {
          sonnet: { total: 0, today: 0 },
          opus: { total: 0, today: 0 }
        }
      }
    };
    
    try {
      // 환경 변수로 grading 앱 URL 설정 가능
      // 기본값: 프로덕션 - grading.bluenote.site, 개발 - localhost:3001
      const gradingUrl = process.env.GRADING_APP_URL 
        ? `${process.env.GRADING_APP_URL}/api/stats`
        : process.env.NODE_ENV === 'production' 
          ? 'https://grading.bluenote.site/api/stats'
          : 'http://localhost:3001/api/stats';
      
      const response = await fetch(gradingUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        // 타임아웃 설정
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        gradingStats = await response.json();
      }
    } catch (error) {
      // 오류가 발생해도 기본값 반환 (grading 앱이 실행되지 않을 수 있음)
    }

    return NextResponse.json(gradingStats);
  } catch (error) {
    console.error('Error in grading stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}