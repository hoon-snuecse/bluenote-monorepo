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
    const rawUserAgent = request.headers.get('user-agent') || '';
    
    console.log('Device Info API - email:', session.user.email);
    console.log('Device Info API - Raw User-Agent:', rawUserAgent);
    console.log('Device Info API - userAgent result:', { device, browser, os });
    
    // 디바이스 정보 추출
    let deviceInfo = 'Unknown';
    let browserInfo = 'Unknown';
    
    // Raw User-Agent로 직접 파싱 (Next.js userAgent가 부정확한 경우 대비)
    if (rawUserAgent) {
      // 브라우저 감지
      if (rawUserAgent.includes('Firefox')) {
        browserInfo = 'Firefox';
      } else if (rawUserAgent.includes('Edg')) {
        browserInfo = 'Edge';
      } else if (rawUserAgent.includes('Chrome') && !rawUserAgent.includes('Edg')) {
        browserInfo = 'Chrome';
      } else if (rawUserAgent.includes('Safari') && !rawUserAgent.includes('Chrome')) {
        browserInfo = 'Safari';
      } else if (browser.name) {
        browserInfo = browser.name;
      }
      
      // OS/디바이스 감지
      if (rawUserAgent.includes('Macintosh') || rawUserAgent.includes('Mac OS')) {
        deviceInfo = 'macOS';
      } else if (rawUserAgent.includes('Windows')) {
        deviceInfo = 'Windows';
      } else if (rawUserAgent.includes('Android')) {
        deviceInfo = 'Android';
      } else if (rawUserAgent.includes('iPhone') || rawUserAgent.includes('iPad')) {
        deviceInfo = 'iOS';
      } else if (rawUserAgent.includes('Linux')) {
        deviceInfo = 'Linux';
      } else if (os.name) {
        deviceInfo = os.name;
      } else {
        deviceInfo = 'Desktop';
      }
    }
    
    // Supabase에 업데이트
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    console.log('[Device Info API] Final values:', { 
      device: deviceInfo, 
      browser: browserInfo, 
      date: today 
    });
    
    const { data: updateData, error } = await supabase
      .from('user_daily_stats')
      .update({
        last_device: deviceInfo,
        last_browser: browserInfo,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_email', session.user.email)
      .eq('date', today)
      .select();
    
    console.log('[Device Info API] Update result:', { 
      email: session.user.email,
      updateData,
      error 
    });
    
    if (error) {
      console.error('Error updating device info:', error);
      return NextResponse.json({ error: 'Failed to update device info' }, { status: 500 });
    }
    
    // 업데이트된 데이터가 없으면 레코드가 없는 것일 수 있음
    if (!updateData || updateData.length === 0) {
      console.log('[Device Info API] No records updated - might need to create new record');
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