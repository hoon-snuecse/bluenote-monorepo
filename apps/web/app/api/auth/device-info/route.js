import { NextResponse, userAgent } from 'next/server';
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
    
    // Next.js 내장 userAgent 사용
    const { device, browser, os } = userAgent(request);
    
    console.log('Device Info API - email:', session.user.email);
    console.log('Device Info API - userAgent result:', { device, browser, os });
    
    // 디바이스 정보 추출
    let deviceInfo = 'Unknown';
    let browserInfo = 'Unknown';
    
    // 브라우저 정보
    if (browser.name) {
      browserInfo = browser.name;
    }
    
    // 디바이스 정보
    if (device.type === 'mobile') {
      deviceInfo = 'Mobile';
    } else if (device.type === 'tablet') {
      deviceInfo = 'Tablet';
    } else if (os.name) {
      // 데스크톱의 경우 OS 정보 사용
      if (os.name.includes('Mac')) {
        deviceInfo = 'macOS';
      } else if (os.name.includes('Windows')) {
        deviceInfo = 'Windows';
      } else if (os.name.includes('Linux')) {
        deviceInfo = 'Linux';
      } else {
        deviceInfo = os.name || 'Desktop';
      }
    } else {
      deviceInfo = 'Desktop';
    }
    
    // Supabase에 업데이트
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    console.log('[Device Info API] Final values:', { 
      device: deviceInfo, 
      browser: browserInfo, 
      date: today 
    });
    
    const { error } = await supabase
      .from('user_daily_stats')
      .update({
        last_device: deviceInfo,
        last_browser: browserInfo,
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
      device: deviceInfo,
      browser: browserInfo
    });
    
  } catch (error) {
    console.error('Device info API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}