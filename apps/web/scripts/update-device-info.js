// 샘플 디바이스/브라우저 정보를 업데이트하는 스크립트

import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
config({ path: join(__dirname, '..', '.env.local') });

import { createAdminClient } from '../lib/supabase/admin.js';

async function updateDeviceInfo() {
  console.log('Updating device info for users...');
  
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    // 샘플 디바이스 정보
    const deviceData = [
      { email: 'hoon@snuecse.org', device: 'Desktop', browser: 'Chrome' },
      { email: 'hoon@iw.es.kr', device: 'iOS', browser: 'Safari' },
      { email: 'sociogram@gmail.com', device: 'Android', browser: 'Chrome' },
      { email: 'waurimal@snuecse.org', device: 'Desktop', browser: 'Firefox' },
      { email: 'sscola@snuecse.org', device: 'Desktop', browser: 'Edge' },
    ];
    
    for (const user of deviceData) {
      const { error } = await supabase
        .from('user_daily_stats')
        .update({
          last_device: user.device,
          last_browser: user.browser,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', user.email)
        .eq('date', today);
      
      if (error) {
        console.error(`Error updating device info for ${user.email}:`, error);
      } else {
        console.log(`Updated ${user.email}: ${user.device} / ${user.browser}`);
      }
    }
    
    console.log('\nDevice info update completed!');
    
  } catch (error) {
    console.error('Error updating device info:', error);
    process.exit(1);
  }
}

// 스크립트 실행
updateDeviceInfo();