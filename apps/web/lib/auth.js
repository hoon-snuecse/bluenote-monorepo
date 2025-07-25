import { createAuthOptions } from '@bluenote/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Supabase 기반 권한 체크 함수들
const authCallbacks = {
  // 로그인 활동 기록 함수
  logLoginActivity: async (email) => {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? createAdminClient() 
        : await createClient();
      
      // 로그인 활동 기록
      await supabase
        .from('usage_logs')
        .insert({
          user_email: email,
          action_type: 'login',
          metadata: { timestamp: new Date().toISOString() }
        });
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
      
      // 로그인 활동 기록
      await authCallbacks.logLoginActivity(email);
      
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