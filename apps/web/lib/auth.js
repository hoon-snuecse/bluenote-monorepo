// Web 앱용 Supabase Auth 헬퍼
import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';

// 세션 확인 및 권한 체크 함수
export async function getServerSession() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  // 권한 체크
  const email = session.user.email;
  const isAllowed = await checkUserPermission(email);
  
  if (!isAllowed) {
    console.log(`Access denied for ${email} - not in allowed users`);
    return null;
  }
  
  // 로그인 활동 기록
  await logSignIn(email);
  
  // 권한 정보 추가
  const permissions = await getUserPermissions(email);
  
  return {
    ...session,
    user: {
      ...session.user,
      permissions
    }
  };
}

// 로그인 활동 기록 함수
async function logSignIn(email) {
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
}

// 사용자 권한 체크
async function checkUserPermission(email) {
  try {
    // First check if email is in admin list as a fallback
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (adminEmails.includes(email)) {
      console.log(`User ${email} allowed via ADMIN_EMAILS`);
      return true;
    }
    
    // Use admin client for auth checks (bypasses RLS)
    const supabase = createAdminClient();
    
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
}

// 사용자 권한 정보 가져오기
async function getUserPermissions(email) {
  try {
    // Use admin client for auth checks (bypasses RLS)
    const supabase = createAdminClient();
    
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

// NextAuth 호환성을 위한 래퍼 (기존 코드 호환성 유지)
export const authOptions = {
  // Supabase Auth는 자체 세션 관리를 하므로 이 부분은 사용되지 않음
  // 하지만 기존 코드 호환성을 위해 유지
};

// 추가 헬퍼 함수들
export { checkUserPermission, getUserPermissions, logSignIn };