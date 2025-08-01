import { NextResponse } from 'next/server';
import UAParser from 'ua-parser-js';

export async function GET(request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // ua-parser-js로 파싱
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  // 기존 방식으로도 파싱
  let oldDevice = 'Unknown';
  let oldBrowser = 'Unknown';
  
  // 기존 브라우저 감지
  if (/edg/i.test(userAgent)) {
    oldBrowser = 'Edge';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    oldBrowser = 'Safari';
  } else if (/chrome/i.test(userAgent)) {
    oldBrowser = 'Chrome';
  }
  
  // 기존 디바이스 감지
  if (/mobile/i.test(userAgent)) {
    oldDevice = 'Mobile';
  } else if (/macintosh/i.test(userAgent)) {
    oldDevice = 'macOS';
  } else {
    oldDevice = 'Desktop';
  }
  
  return NextResponse.json({
    userAgent,
    uaParserResults: {
      browser: result.browser,
      os: result.os,
      device: result.device,
      cpu: result.cpu,
      engine: result.engine
    },
    oldMethod: {
      device: oldDevice,
      browser: oldBrowser
    },
    comparison: {
      browserImproved: result.browser.name !== oldBrowser,
      deviceImproved: (result.os.name || result.device.type || 'Desktop') !== oldDevice
    }
  });
}