import { NextResponse, userAgent } from 'next/server';
// Removed next-auth import
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    // 세션 확인
    const supabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const session = user ? { user } : null;
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Next.js 내장 userAgent 사용
    const { device, browser, os } = userAgent(request);
    const rawUserAgent = request.headers.get('user-agent') || '';
    
    
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
    const adminSupabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    
    const { error } = await adminSupabase
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