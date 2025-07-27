// 오래된 통계 데이터를 월별로 압축하는 스크립트
// cron job으로 매월 실행 권장

import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
config({ path: join(__dirname, '..', '.env.local') });

import { createAdminClient } from '../lib/supabase/admin.js';

async function archiveOldStats() {
  console.log('Starting monthly stats archiving...');
  
  try {
    const supabase = createAdminClient();
    
    // 1. 6개월 이상 된 일별 데이터를 월별로 집계
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoffDate = sixMonthsAgo.toISOString().split('T')[0];
    
    console.log(`Archiving data older than: ${cutoffDate}`);
    
    // 월별 통계 테이블이 없으면 생성
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_monthly_stats (
          id SERIAL PRIMARY KEY,
          user_email TEXT NOT NULL,
          month DATE NOT NULL,
          login_count INTEGER DEFAULT 0,
          claude_usage_count INTEGER DEFAULT 0,
          grading_sonnet_count INTEGER DEFAULT 0,
          grading_opus_count INTEGER DEFAULT 0,
          post_count INTEGER DEFAULT 0,
          last_login_at TIMESTAMPTZ,
          days_with_activity INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_email, month)
        );
        
        -- RLS 설정
        ALTER TABLE public.user_monthly_stats ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Service role only" ON public.user_monthly_stats
          FOR ALL TO service_role
          USING (true) WITH CHECK (true);
          
        REVOKE ALL ON public.user_monthly_stats FROM anon, authenticated;
        GRANT ALL ON public.user_monthly_stats TO service_role;
      `
    });
    
    if (createError && !createError.message.includes('already exists')) {
      console.error('Error creating monthly stats table:', createError);
      return;
    }
    
    // 2. 오래된 일별 데이터를 월별로 집계
    const { data: oldStats, error: fetchError } = await supabase
      .from('user_daily_stats')
      .select('*')
      .lt('date', cutoffDate)
      .order('date', { ascending: true });
    
    if (fetchError) {
      console.error('Error fetching old stats:', fetchError);
      return;
    }
    
    console.log(`Found ${oldStats.length} daily records to archive`);
    
    // 월별로 그룹화
    const monthlyStats = {};
    
    oldStats.forEach(stat => {
      const monthKey = stat.date.substring(0, 7) + '-01'; // YYYY-MM-01
      const userKey = `${stat.user_email}_${monthKey}`;
      
      if (!monthlyStats[userKey]) {
        monthlyStats[userKey] = {
          user_email: stat.user_email,
          month: monthKey,
          login_count: 0,
          claude_usage_count: 0,
          grading_sonnet_count: 0,
          grading_opus_count: 0,
          post_count: 0,
          last_login_at: null,
          days_with_activity: 0
        };
      }
      
      const monthly = monthlyStats[userKey];
      monthly.login_count += stat.login_count || 0;
      monthly.claude_usage_count += stat.claude_usage_count || 0;
      monthly.grading_sonnet_count += stat.grading_sonnet_count || 0;
      monthly.grading_opus_count += stat.grading_opus_count || 0;
      monthly.post_count += stat.post_count || 0;
      
      if (stat.last_login_at && (!monthly.last_login_at || stat.last_login_at > monthly.last_login_at)) {
        monthly.last_login_at = stat.last_login_at;
      }
      
      if ((stat.login_count || 0) > 0 || (stat.claude_usage_count || 0) > 0) {
        monthly.days_with_activity++;
      }
    });
    
    // 3. 월별 통계 저장
    const monthlyStatsArray = Object.values(monthlyStats);
    
    for (const stats of monthlyStatsArray) {
      const { error: upsertError } = await supabase
        .from('user_monthly_stats')
        .upsert(stats, {
          onConflict: 'user_email,month'
        });
      
      if (upsertError) {
        console.error(`Error upserting monthly stats for ${stats.user_email} ${stats.month}:`, upsertError);
      }
    }
    
    console.log(`Archived ${monthlyStatsArray.length} monthly records`);
    
    // 4. 오래된 일별 데이터 삭제 (선택적 - 주석 해제하여 사용)
    /*
    const { error: deleteError } = await supabase
      .from('user_daily_stats')
      .delete()
      .lt('date', cutoffDate);
    
    if (deleteError) {
      console.error('Error deleting old daily stats:', deleteError);
    } else {
      console.log(`Deleted ${oldStats.length} old daily records`);
    }
    */
    
    // 5. 통계 요약
    const { data: summary } = await supabase
      .from('user_monthly_stats')
      .select('month')
      .order('month', { ascending: false })
      .limit(12);
    
    console.log('Archive summary:');
    console.log(`- Total monthly records: ${summary?.length || 0}`);
    console.log(`- Latest month: ${summary?.[0]?.month || 'N/A'}`);
    console.log(`- Oldest month: ${summary?.[summary?.length - 1]?.month || 'N/A'}`);
    
  } catch (error) {
    console.error('Error in archiving process:', error);
    process.exit(1);
  }
}

// 스크립트 실행
archiveOldStats();