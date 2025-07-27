// 이 스크립트는 grading 앱의 채점 통계를 가져와서 
// user_daily_stats 테이블을 업데이트합니다.
// cron job이나 수동으로 실행할 수 있습니다.

import { createAdminClient } from '../lib/supabase/admin.js';

async function syncGradingStats() {
  console.log('Starting grading stats sync...');
  
  try {
    // 1. grading 앱에서 일별 사용자별 통계 가져오기
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://grading.bluenote.site'
      : 'http://localhost:3002';
    
    const response = await fetch(`${baseUrl}/api/stats/daily-user-evaluations`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch grading stats: ${response.status}`);
    }
    
    const data = await response.json();
    const { dailyStats } = data;
    
    // 2. Supabase admin client 생성
    const supabase = createAdminClient();
    
    // 3. 각 날짜별로 데이터 업데이트
    for (const [date, userStats] of Object.entries(dailyStats)) {
      for (const [userEmail, stats] of Object.entries(userStats)) {
        console.log(`Updating stats for ${userEmail} on ${date}:`, stats);
        
        // user_daily_stats 업데이트
        const { error } = await supabase
          .from('user_daily_stats')
          .upsert({
            user_email: userEmail,
            date: date,
            grading_sonnet_count: stats.sonnet,
            grading_opus_count: stats.opus,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_email,date'
          });
        
        if (error) {
          console.error(`Error updating stats for ${userEmail} on ${date}:`, error);
        }
      }
    }
    
    console.log('Grading stats sync completed successfully!');
    console.log(`Total dates processed: ${Object.keys(dailyStats).length}`);
    console.log(`Total users: ${Object.keys(data.userTotals).length}`);
    
  } catch (error) {
    console.error('Error syncing grading stats:', error);
    process.exit(1);
  }
}

// 스크립트 실행
syncGradingStats();