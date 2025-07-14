import { createClient } from '@/lib/supabase/server';

/**
 * Check if user has permission to perform an action
 * @param {string} email - User email
 * @returns {Promise<{allowed: boolean, role: string, canWrite: boolean}>}
 */
export async function checkUserPermission(email) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_permissions')
      .select('role, can_write')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return { allowed: false, role: 'none', canWrite: false };
    }
    
    return { 
      allowed: true, 
      role: data.role, 
      canWrite: data.can_write 
    };
  } catch (error) {
    console.error('Error checking user permission:', error);
    return { allowed: false, role: 'none', canWrite: false };
  }
}

/**
 * Check Claude usage for today
 * @param {string} email - User email
 * @returns {Promise<{used: number, limit: number, remaining: number}>}
 */
export async function checkClaudeUsage(email) {
  try {
    const supabase = await createClient();
    
    // Get user's daily limit
    const { data: userData, error: userError } = await supabase
      .from('user_permissions')
      .select('claude_daily_limit, role')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      return { used: 0, limit: 0, remaining: 0 };
    }
    
    // Count today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error: countError } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', email)
      .eq('action_type', 'claude_chat')
      .gte('created_at', today.toISOString());
    
    if (countError) {
      console.error('Error counting usage:', countError);
      return { used: 0, limit: userData.claude_daily_limit, remaining: userData.claude_daily_limit };
    }
    
    const used = count || 0;
    const limit = userData.claude_daily_limit;
    const remaining = Math.max(0, limit - used);
    
    return { used, limit, remaining };
  } catch (error) {
    console.error('Error checking Claude usage:', error);
    return { used: 0, limit: 0, remaining: 0 };
  }
}

/**
 * Record a usage action
 * @param {string} email - User email
 * @param {string} actionType - Type of action (claude_chat, post_write, etc.)
 * @returns {Promise<boolean>} - Success status
 */
export async function recordUsage(email, actionType) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('usage_logs')
      .insert([{ 
        user_email: email, 
        action_type: actionType 
      }]);
    
    if (error) {
      console.error('Error recording usage:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error recording usage:', error);
    return false;
  }
}

/**
 * Get usage statistics for admin dashboard
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<Object>} - Usage statistics
 */
export async function getUsageStats(days = 7) {
  try {
    const supabase = await createClient();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    // Get usage summary
    const { data: usageData, error: usageError } = await supabase
      .from('daily_usage_summary')
      .select('*')
      .gte('usage_date', startDate.toISOString().split('T')[0])
      .order('usage_date', { ascending: false });
    
    if (usageError) {
      console.error('Error fetching usage stats:', usageError);
      return { error: 'Failed to fetch usage statistics' };
    }
    
    // Get total users
    const { count: userCount, error: userCountError } = await supabase
      .from('user_permissions')
      .select('*', { count: 'exact', head: true });
    
    if (userCountError) {
      console.error('Error counting users:', userCountError);
    }
    
    // Process data for dashboard
    const stats = {
      totalUsers: userCount || 0,
      dailyUsage: usageData || [],
      summary: {
        claudeChats: 0,
        postsWritten: 0,
        postsEdited: 0,
        postsDeleted: 0
      }
    };
    
    // Calculate summary
    usageData?.forEach(record => {
      switch(record.action_type) {
        case 'claude_chat':
          stats.summary.claudeChats += record.action_count;
          break;
        case 'post_write':
          stats.summary.postsWritten += record.action_count;
          break;
        case 'post_edit':
          stats.summary.postsEdited += record.action_count;
          break;
        case 'post_delete':
          stats.summary.postsDeleted += record.action_count;
          break;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return { error: 'Failed to fetch usage statistics' };
  }
}