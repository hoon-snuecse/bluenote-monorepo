import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 강제로 device-info API 호출하기 위한 엔드포인트
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // device-info API 호출
    const response = await fetch(new URL('/api/auth/device-info', request.url).href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
        'Cookie': request.headers.get('cookie') || ''
      }
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      message: 'Device info update forced',
      sessionUser: session.user.email,
      updateResult: data
    });
    
  } catch (error) {
    console.error('Force device info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}