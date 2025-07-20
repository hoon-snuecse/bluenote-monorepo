import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = await request.json();
    const supabase = createAdminClient();
    
    // Use raw SQL query instead of Supabase client methods
    const { data, error } = await supabase.rpc('update_system_settings', {
      p_site_name: settings.siteName,
      p_site_description: settings.siteDescription,
      p_admin_email: settings.adminEmail,
      p_claude_enabled: settings.claudeEnabled,
      p_claude_default_daily_limit: settings.claudeDefaultDailyLimit,
      p_claude_system_prompt: settings.claudeSystemPrompt,
      p_claude_model: settings.claudeModel,
      p_posts_per_page: settings.postsPerPage,
      p_enable_comments: settings.enableComments,
      p_enable_search: settings.enableSearch,
      p_default_categories: settings.defaultCategories,
      p_session_timeout: settings.sessionTimeout,
      p_max_login_attempts: settings.maxLoginAttempts,
      p_enable_ip_whitelist: settings.enableIPWhitelist,
      p_ip_whitelist: settings.ipWhitelist,
      p_auto_backup: settings.autoBackup,
      p_backup_frequency: settings.backupFrequency,
      p_log_retention_days: settings.logRetentionDays,
      p_enable_maintenance_mode: settings.enableMaintenanceMode,
      p_updated_by: session.user.email
    });

    if (error) {
      console.error('RPC error:', error);
      return NextResponse.json({ 
        error: 'Failed to save settings',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ 
      error: 'Failed to save settings',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}