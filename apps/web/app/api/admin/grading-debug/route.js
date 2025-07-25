import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // 관리자 권한 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Grading 앱의 debug API 호출
    const gradingApiUrl = process.env.NODE_ENV === 'production'
      ? 'https://grading.bluenote.site/api/stats/debug'
      : 'http://localhost:3002/api/stats/debug';

    console.log('Fetching from grading debug API:', gradingApiUrl);

    const response = await fetch(gradingApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grading debug API response not ok:', response.status, errorText);
      throw new Error(`Failed to fetch grading debug data: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Debug data received:', JSON.stringify(data, null, 2));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching grading debug data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch grading debug data',
        details: error.message,
        gradingApiUrl: process.env.NODE_ENV === 'production'
          ? 'https://grading.bluenote.site/api/stats/debug'
          : 'http://localhost:3002/api/stats/debug'
      },
      { status: 500 }
    );
  }
}