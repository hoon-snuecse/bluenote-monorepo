import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    // Grading 앱의 테스트 데이터 추가 API 호출
    try {
      const gradingUrl = process.env.GRADING_APP_URL 
        ? `${process.env.GRADING_APP_URL}/api/test/add-evaluations`
        : process.env.NODE_ENV === 'production' 
          ? 'https://grading.bluenote.site/api/test/add-evaluations'
          : 'http://localhost:3001/api/test/add-evaluations';
      
      console.log('Adding test data to grading app:', gradingUrl);
        
      const response = await fetch(gradingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 타임아웃 설정
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Test data added successfully:', result);
        return NextResponse.json(result);
      } else {
        const errorText = await response.text();
        console.error('Grading test data API error:', response.status, errorText);
        return NextResponse.json(
          { error: `Grading API error: ${response.status}`, details: errorText },
          { status: response.status }
        );
      }
    } catch (error) {
      console.error('Failed to add test data:', error.message);
      
      // grading 앱에 연결할 수 없는 경우 기본 응답
      return NextResponse.json({
        error: 'Cannot connect to grading app',
        message: 'grading 앱이 실행 중이지 않거나 연결할 수 없습니다.',
        details: error.message,
        suggestion: '로컬에서는 grading 앱을 포트 3001에서 실행해주세요.'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Error in grading test data API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}