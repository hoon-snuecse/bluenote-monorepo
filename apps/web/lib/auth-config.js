import { createAuthOptions } from '@bluenote/auth';
import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';

// Supabase를 사용한 권한 확인 콜백
const authCallbacks = {
  checkUserPermission: async (email) => {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? createAdminClient() 
        : await createClient();
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select('email')
        .eq('email', email)
        .single();
      
      return !error && !!data;
    } catch (error) {
      console.error('Error in checkUserPermission:', error);
      return false;
    }
  },
  
  getUserPermissions: async (email) => {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? createAdminClient() 
        : await createClient();
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select('role, can_write, claude_daily_limit')
        .eq('email', email)
        .single();
      
      return error ? null : data;
    } catch (error) {
      console.error('Error in getUserPermissions:', error);
      return null;
    }
  }
};

export const authOptions = createAuthOptions(authCallbacks);