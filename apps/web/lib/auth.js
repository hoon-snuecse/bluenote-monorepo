import { createAuthOptions } from '@bluenote/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Supabase 기반 권한 체크 함수들
const authCallbacks = {
  // 로그인 활동 기록 함수
  logSignIn: async (email, request) => {
    try {
      const supabase = createAdminClient();
      
      // 로그인 활동 기록
      const { error: logError } = await supabase
        .from('usage_logs')
        .insert({
          user_email: email,
          action_type: 'login'
        });
        
      if (logError) {
        console.error('Error inserting login log:', logError);
      }
      
      // 현재는 디바이스/브라우저 정보를 Unknown으로 설정
      // 향후 클라이언트 측에서 업데이트 필요
      let device = 'Unknown';
      let browser = 'Unknown';
      
      // user_daily_stats 업데이트
      const today = new Date().toISOString().split('T')[0];
      
      // 먼저 오늘의 기존 통계를 가져옴
      const { data: existingStats, error: fetchError } = await supabase
        .from('user_daily_stats')
        .select('login_count')
        .eq('user_email', email)
        .eq('date', today)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing stats:', fetchError);
      }
      
      const currentCount = existingStats?.login_count || 0;
      
      // user_daily_stats 업데이트 또는 삽입
      // 디바이스/브라우저 정보는 나중에 DeviceInfoUpdater가 업데이트하므로
      // 여기서는 로그인 횟수와 시간만 업데이트
      const updateData = {
        user_email: email,
        date: today,
        login_count: currentCount + 1,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 기존 레코드가 없을 때만 기본값 설정
      if (!existingStats) {
        updateData.last_device = device;
        updateData.last_browser = browser;
      }
      
      const { error: statsError } = await supabase
        .from('user_daily_stats')
        .upsert(updateData, {
          onConflict: 'user_email,date'
        });
      
      if (statsError) {
        console.error('Error updating user_daily_stats:', statsError);
      }
      
      // daily_stats 테이블도 업데이트
      const { data: dailyData, error: dailyFetchError } = await supabase
        .from('daily_stats')
        .select('login_count, unique_login_count')
        .eq('date', today)
        .single();
      
      if (!dailyFetchError || dailyFetchError.code === 'PGRST116') {
        const loginCount = (dailyData?.login_count || 0) + 1;
        const uniqueCount = dailyData?.unique_login_count || 1;
        
        const { error: dailyError } = await supabase
          .from('daily_stats')
          .upsert({
            date: today,
            login_count: loginCount,
            unique_login_count: uniqueCount,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'date'
          });
        
        if (dailyError) {
          console.error('Error updating daily_stats:', dailyError);
        }
      }
    } catch (error) {
      console.error('Error logging login activity:', error);
    }
  },
  checkUserPermission: async (email) => {
    try {
      // First check if email is in admin list as a fallback
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
      if (adminEmails.includes(email)) {
        console.log(`User ${email} allowed via ADMIN_EMAILS`);
        return true;
      }
      
      // Use admin client for auth checks (bypasses RLS)
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? createAdminClient() 
        : await createClient();
      
      // Check if user is in the allowed users table
      const { data, error } = await supabase
        .from('user_permissions')
        .select('email')
        .eq('email', email)
        .single();
      
      // If user is not found in permissions table, deny access
      if (error || !data) {
        console.log(`Login denied for ${email} - not in allowed users`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in checkUserPermission:', error);
      // Fallback to admin emails check
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
      return adminEmails.includes(email);
    }
  },
  
  getUserPermissions: async (email) => {
    try {
      // Use admin client for auth checks (bypasses RLS)
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? createAdminClient() 
        : await createClient();
      
      // Get user permissions from Supabase
      const { data, error } = await supabase
        .from('user_permissions')
        .select('role, can_write, claude_daily_limit')
        .eq('email', email)
        .single();
      
      if (error || !data) return null;
      
      return {
        role: data.role || 'user',
        can_write: data.can_write || false,
        claude_daily_limit: data.claude_daily_limit || 3
      };
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return null;
    }
  }
};

// 공유 auth 설정 사용 - 쿠키 도메인 설정이 포함됨
export const authOptions = createAuthOptions(authCallbacks);