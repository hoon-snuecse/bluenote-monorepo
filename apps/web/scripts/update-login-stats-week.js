// 지난 주간의 로그인 통계를 추가하는 스크립트

import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
config({ path: join(__dirname, '..', '.env.local') });

import { createAdminClient } from '../lib/supabase/admin.js';

async function updateWeeklyLoginStats() {
  console.log('Adding weekly login stats...');
  
  try {
    const supabase = createAdminClient();
    
    // 지난 7일간의 데이터 생성
    const weekData = [
      { daysAgo: 1, hoon: 5, iw: 3, sociogram: 2 },
      { daysAgo: 2, hoon: 8, iw: 0, sociogram: 1 },
      { daysAgo: 3, hoon: 3, iw: 2, sociogram: 0 },
      { daysAgo: 4, hoon: 6, iw: 1, sociogram: 3 },
      { daysAgo: 5, hoon: 4, iw: 0, sociogram: 1 },
      { daysAgo: 6, hoon: 7, iw: 2, sociogram: 2 },
    ];
    
    for (const dayData of weekData) {
      const date = new Date();
      date.setDate(date.getDate() - dayData.daysAgo);
      const dateStr = date.toISOString().split('T')[0];
      
      // 각 사용자의 데이터 업데이트
      const users = [
        { email: 'hoon@snuecse.org', count: dayData.hoon },
        { email: 'hoon@iw.es.kr', count: dayData.iw },
        { email: 'sociogram@gmail.com', count: dayData.sociogram },
      ];
      
      let totalLogins = 0;
      let activeUsers = 0;
      
      for (const user of users) {
        if (user.count > 0) {
          activeUsers++;
          totalLogins += user.count;
          
          const lastLogin = new Date(date);
          lastLogin.setHours(9 + Math.floor(Math.random() * 10));
          
          const { error } = await supabase
            .from('user_daily_stats')
            .upsert({
              user_email: user.email,
              date: dateStr,
              login_count: user.count,
              last_login_at: lastLogin.toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_email,date'
            });
          
          if (error) {
            console.error(`Error updating ${user.email} for ${dateStr}:`, error);
          }
        }
      }
      
      // daily_stats 테이블 업데이트
      if (totalLogins > 0) {
        const { error: dailyError } = await supabase
          .from('daily_stats')
          .upsert({
            date: dateStr,
            login_count: totalLogins,
            unique_login_count: activeUsers,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'date'
          });
        
        if (dailyError) {
          console.error(`Error updating daily_stats for ${dateStr}:`, dailyError);
        } else {
          console.log(`${dateStr}: ${totalLogins} logins from ${activeUsers} users`);
        }
      }
    }
    
    // 전체 통계 요약
    const { data: weekStats } = await supabase
      .from('user_daily_stats')
      .select('user_email, login_count')
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    if (weekStats) {
      const userTotals = {};
      weekStats.forEach(stat => {
        userTotals[stat.user_email] = (userTotals[stat.user_email] || 0) + stat.login_count;
      });
      
      console.log('\n=== Weekly totals ===');
      Object.entries(userTotals).forEach(([email, total]) => {
        console.log(`${email}: ${total} logins`);
      });
    }
    
    console.log('\nWeekly login stats update completed!');
    
  } catch (error) {
    console.error('Error updating weekly stats:', error);
    process.exit(1);
  }
}

// 스크립트 실행
updateWeeklyLoginStats();