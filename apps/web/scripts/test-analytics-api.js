import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
config({ path: join(__dirname, '..', '.env.local') });

async function testAnalyticsAPI() {
  console.log('Testing analytics-optimized API...');
  
  try {
    // 로컬 개발 서버 URL
    const baseUrl = 'http://localhost:3000';
    
    // 세션 쿠키가 필요하므로 브라우저에서 로그인한 후 개발자 도구에서 쿠키를 복사해야 합니다.
    // 이 스크립트는 API 응답 구조를 확인하는 용도입니다.
    console.log('\nPlease test the API directly in the browser:');
    console.log(`${baseUrl}/api/admin/analytics-optimized`);
    console.log('\nOr use curl with your session cookie:');
    console.log(`curl "${baseUrl}/api/admin/analytics-optimized" -H "Cookie: YOUR_SESSION_COOKIE" | jq .`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAnalyticsAPI();