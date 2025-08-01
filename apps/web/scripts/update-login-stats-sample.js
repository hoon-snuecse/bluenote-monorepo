// 임시로 로그인 통계를 업데이트하는 스크립트
// user_daily_stats 테이블에 오늘 날짜의 로그인 통계를 추가합니다.

import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
config({ path: join(__dirname, '..', '.env.local') });

import { createAdminClient } from '../lib/supabase/admin.js';

async function updateLoginStats() {
  console.log('Updating login stats sample data...');
  
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    
    // 샘플 로그인 데이터
    const sampleData = [
      { email: 'hoon@snuecse.org', loginCount: 3, lastLogin: new Date() },
      { email: 'hoon@iw.es.kr', loginCount: 2, lastLogin: new Date(Date.now() - 3600000) },
      { email: 'sociogram@gmail.com', loginCount: 1, lastLogin: new Date(Date.now() - 7200000) },
    ];
    
    for (const user of sampleData) {
      const { error } = await supabase
        .from('user_daily_stats')
        .upsert({
          user_email: user.email,
          date: today,
          login_count: user.loginCount,
          last_login_at: user.lastLogin.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_email,date'
        });
      
      if (error) {
        console.error(`Error updating stats for ${user.email}:`, error);
      } else {
        console.log(`Updated stats for ${user.email}: ${user.loginCount} logins`);
      }
    }
    
    // daily_stats 테이블도 업데이트
    const totalLogins = sampleData.reduce((sum, user) => sum + user.loginCount, 0);
    const uniqueUsers = sampleData.length;
    
    const { error: dailyError } = await supabase
      .from('daily_stats')
      .upsert({
        date: today,
        login_count: totalLogins,
        unique_login_count: uniqueUsers,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date'
      });
    
    if (dailyError) {
      console.error('Error updating daily_stats:', dailyError);
    } else {
      console.log(`Updated daily_stats: ${totalLogins} total logins from ${uniqueUsers} unique users`);
    }
    
    console.log('\nLogin stats update completed!');
    
  } catch (error) {
    console.error('Error updating login stats:', error);
    process.exit(1);
  }
}

// 스크립트 실행
updateLoginStats();