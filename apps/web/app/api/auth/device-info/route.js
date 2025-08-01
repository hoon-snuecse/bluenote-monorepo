import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import UAParser from 'ua-parser-js';

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
    
    // ua-parser-js로 User-Agent 파싱
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    // 디바이스 정보 추출
    let device = 'Unknown';
    let browser = 'Unknown';
    
    // 브라우저 정보
    if (result.browser.name) {
      browser = result.browser.name;
      // 버전 정보도 포함하고 싶다면:
      // browser = `${result.browser.name} ${result.browser.version || ''}`.trim();
    }
    
    // 디바이스 정보
    if (result.device.type) {
      // mobile, tablet, console, smarttv, wearable, embedded 등
      device = result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1);
      
      // 디바이스 모델명이 있으면 추가
      if (result.device.model) {
        device = result.device.model;
      }
    } else if (result.os.name) {
      // 디바이스 타입이 없으면 OS 정보 사용
      device = result.os.name;
      
      // macOS의 경우 더 구체적인 정보 제공
      if (result.os.name === 'Mac OS' && result.cpu.architecture) {
        device = 'macOS';
        // Apple Silicon인지 Intel인지 구분 가능
        if (result.cpu.architecture === 'arm64') {
          device = 'macOS (Apple Silicon)';
        }
      } else if (result.os.name === 'Windows') {
        device = `Windows ${result.os.version || ''}`.trim();
      }
    } else {
      // 기본값은 Desktop
      device = 'Desktop';
    }
    
    // Supabase에 업데이트
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Device Info API - parsed result:', {
      browser: result.browser,
      os: result.os,
      device: result.device,
      cpu: result.cpu
    });
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