import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // User-Agent 정보 가져오기
    const userAgent = request.headers.get('user-agent') || '';
    
    console.log('Device Info API - email:', session.user.email);
    console.log('Device Info API - userAgent:', userAgent);
    
    let device = 'Unknown';
    let browser = 'Unknown';
    
    // 디바이스 타입 감지
    if (/mobile/i.test(userAgent)) {
      if (/iphone|ipad|ipod/i.test(userAgent)) {
        device = 'iOS';
      } else if (/android/i.test(userAgent)) {
        device = 'Android';
      } else {
        device = 'Mobile';
      }
    } else if (/tablet/i.test(userAgent)) {
      device = 'Tablet';
    } else {
      device = 'Desktop';
    }
    
    // 브라우저 감지 (순서가 중요 - 더 구체적인 것부터 확인)
    if (/edg/i.test(userAgent)) {
      browser = 'Edge';
    } else if (/opr|opera/i.test(userAgent)) {
      browser = 'Opera';
    } else if (/chrome/i.test(userAgent) && !/safari/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/firefox|fxios/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = 'Safari';
    }
    
    // Supabase에 업데이트
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Device Info API - detected:', { device, browser, date: today });
    
    const { error } = await supabase
      .from('user_daily_stats')
      .update({
        last_device: device,
        last_browser: browser,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_email', session.user.email)
      .eq('date', today);
    
    if (error) {
      console.error('Error updating device info:', error);
      return NextResponse.json({ error: 'Failed to update device info' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      device,
      browser
    });
    
  } catch (error) {
    console.error('Device info API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}