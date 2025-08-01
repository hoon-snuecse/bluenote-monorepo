import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
config({ path: join(__dirname, '..', '.env.local') });

import { createAdminClient } from '../lib/supabase/admin.js';

async function checkDeviceInfo() {
  console.log('Checking device info in database...');
  
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    // 오늘의 사용자 통계 확인
    const { data, error } = await supabase
      .from('user_daily_stats')
      .select('user_email, last_device, last_browser, last_login_at')
      .eq('date', today)
      .order('last_login_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('\n최근 로그인 사용자의 디바이스 정보:');
    console.log('=====================================');
    
    data.forEach(user => {
      console.log(`\n이메일: ${user.user_email}`);
      console.log(`디바이스: ${user.last_device}`);
      console.log(`브라우저: ${user.last_browser}`);
      console.log(`로그인 시간: ${new Date(user.last_login_at).toLocaleString('ko-KR')}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDeviceInfo();