// 이 스크립트는 usage_logs 테이블의 로그인 활동을 집계하여
// user_daily_stats 테이블을 업데이트합니다.

import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
config({ path: join(__dirname, '..', '.env.local') });

import { createAdminClient } from '../lib/supabase/admin.js';

async function syncLoginStats() {
  console.log('Starting login stats sync...');
  
  try {
    const supabase = createAdminClient();
    
    // 1. 먼저 usage_logs에서 로그인 데이터 확인
    const { data: recentLogins, error: checkError } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('action_type', 'login')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (checkError) {
      console.error('Error checking usage_logs:', checkError);
      return;
    }
    
    console.log('Recent login logs:', recentLogins?.length || 0);
    if (recentLogins && recentLogins.length > 0) {
      console.log('Sample login log:', recentLogins[0]);
    }
    
    // 2. 일별로 로그인 활동 집계
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // usage_logs에서 일별 로그인 집계
    const { data: loginStats, error: statsError } = await supabase
      .from('usage_logs')
      .select('user_email, created_at')
      .eq('action_type', 'login')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (statsError) {
      console.error('Error fetching login stats:', statsError);
      return;
    }
    
    console.log('Total login records in last 30 days:', loginStats?.length || 0);
    
    // 일별, 사용자별로 집계
    const dailyUserStats = {};
    
    if (loginStats) {
      loginStats.forEach(log => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        const email = log.user_email;
        
        if (!dailyUserStats[date]) {
          dailyUserStats[date] = {};
        }
        
        if (!dailyUserStats[date][email]) {
          dailyUserStats[date][email] = {
            loginCount: 0,
            lastLogin: log.created_at
          };
        }
        
        dailyUserStats[date][email].loginCount++;
        
        // 가장 최근 로그인 시간 업데이트
        if (new Date(log.created_at) > new Date(dailyUserStats[date][email].lastLogin)) {
          dailyUserStats[date][email].lastLogin = log.created_at;
        }
      });
    }
    
    // 3. user_daily_stats 테이블 업데이트
    let updateCount = 0;
    let errorCount = 0;
    
    for (const [date, userStats] of Object.entries(dailyUserStats)) {
      for (const [userEmail, stats] of Object.entries(userStats)) {
        try {
          // 먼저 기존 레코드가 있는지 확인
          const { data: existing, error: checkError } = await supabase
            .from('user_daily_stats')
            .select('*')
            .eq('user_email', userEmail)
            .eq('date', date)
            .single();
          
          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error(`Error checking existing record for ${userEmail} on ${date}:`, checkError);
            errorCount++;
            continue;
          }
          
          const updateData = {
            user_email: userEmail,
            date: date,
            login_count: stats.loginCount,
            last_login_at: stats.lastLogin,
            updated_at: new Date().toISOString()
          };
          
          if (existing) {
            // 기존 레코드 업데이트
            const { error: updateError } = await supabase
              .from('user_daily_stats')
              .update(updateData)
              .eq('user_email', userEmail)
              .eq('date', date);
            
            if (updateError) {
              console.error(`Error updating stats for ${userEmail} on ${date}:`, updateError);
              errorCount++;
            } else {
              updateCount++;
            }
          } else {
            // 새 레코드 삽입
            const { error: insertError } = await supabase
              .from('user_daily_stats')
              .insert(updateData);
            
            if (insertError) {
              console.error(`Error inserting stats for ${userEmail} on ${date}:`, insertError);
              errorCount++;
            } else {
              updateCount++;
            }
          }
        } catch (err) {
          console.error(`Unexpected error for ${userEmail} on ${date}:`, err);
          errorCount++;
        }
      }
    }
    
    console.log('\n=== Login stats sync completed ===');
    console.log(`Total dates processed: ${Object.keys(dailyUserStats).length}`);
    console.log(`Total user-date combinations: ${updateCount + errorCount}`);
    console.log(`Successfully updated: ${updateCount}`);
    console.log(`Errors: ${errorCount}`);
    
    // 4. daily_stats 테이블도 업데이트 (전체 일별 통계)
    console.log('\nUpdating daily_stats table...');
    
    for (const [date, userStats] of Object.entries(dailyUserStats)) {
      const uniqueUsers = Object.keys(userStats).length;
      const totalLogins = Object.values(userStats).reduce((sum, stats) => sum + stats.loginCount, 0);
      
      const { error } = await supabase
        .from('daily_stats')
        .upsert({
          date: date,
          login_count: totalLogins,
          unique_login_count: uniqueUsers,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'date'
        });
      
      if (error) {
        console.error(`Error updating daily_stats for ${date}:`, error);
      }
    }
    
    console.log('Daily stats update completed!');
    
  } catch (error) {
    console.error('Error syncing login stats:', error);
    process.exit(1);
  }
}

// 스크립트 실행
syncLoginStats();