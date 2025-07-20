import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClientForServer } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // Fetch settings from database
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // Convert snake_case to camelCase for client
    const clientSettings = data ? {
      siteName: data.site_name || 'BlueNote Atelier',
      siteDescription: data.site_description || '박교수의 연구실 - 교육과 연구의 공간',
      adminEmail: data.admin_email || 'admin@bluenote.site',
      claudeEnabled: data.claude_enabled ?? true,
      claudeDefaultDailyLimit: data.claude_default_daily_limit || 10,
      claudeSystemPrompt: data.claude_system_prompt || '당신은 교육과 연구를 돕는 AI 어시스턴트입니다.',
      claudeModel: data.claude_model || 'claude-sonnet-4-20250514',
      postsPerPage: data.posts_per_page || 12,
      enableComments: data.enable_comments ?? false,
      enableSearch: data.enable_search ?? true,
      defaultCategories: data.default_categories || ['연구', '교육', '분석', '일상'],
      sessionTimeout: data.session_timeout || 24,
      maxLoginAttempts: data.max_login_attempts || 5,
      enableIPWhitelist: data.enable_ip_whitelist ?? false,
      ipWhitelist: data.ip_whitelist || [],
      autoBackup: data.auto_backup ?? true,
      backupFrequency: data.backup_frequency || 'daily',
      logRetentionDays: data.log_retention_days || 30,
      enableMaintenanceMode: data.enable_maintenance_mode ?? false
    } : {
      siteName: 'BlueNote Atelier',
      siteDescription: '박교수의 연구실 - 교육과 연구의 공간',
      adminEmail: 'admin@bluenote.site',
      claudeEnabled: true,
      claudeDefaultDailyLimit: 10,
      claudeSystemPrompt: '당신은 교육과 연구를 돕는 AI 어시스턴트입니다.',
      claudeModel: 'claude-sonnet-4-20250514',
      postsPerPage: 12,
      enableComments: false,
      enableSearch: true,
      defaultCategories: ['연구', '교육', '분석', '일상'],
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      enableIPWhitelist: false,
      ipWhitelist: [],
      autoBackup: true,
      backupFrequency: 'daily',
      logRetentionDays: 30,
      enableMaintenanceMode: false
    };
    
    return NextResponse.json({ settings: clientSettings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = await request.json();
    const supabase = createAdminClient();
    
    // Convert camelCase to snake_case for database
    const dbSettings = {
      id: 1, // Single row for system settings
      site_name: settings.siteName,
      site_description: settings.siteDescription,
      admin_email: settings.adminEmail,
      claude_enabled: settings.claudeEnabled,
      claude_default_daily_limit: settings.claudeDefaultDailyLimit,
      claude_system_prompt: settings.claudeSystemPrompt,
      claude_model: settings.claudeModel,
      posts_per_page: settings.postsPerPage,
      enable_comments: settings.enableComments,
      enable_search: settings.enableSearch,
      default_categories: settings.defaultCategories,
      session_timeout: settings.sessionTimeout,
      max_login_attempts: settings.maxLoginAttempts,
      enable_ip_whitelist: settings.enableIPWhitelist,
      ip_whitelist: settings.ipWhitelist,
      auto_backup: settings.autoBackup,
      backup_frequency: settings.backupFrequency,
      log_retention_days: settings.logRetentionDays,
      enable_maintenance_mode: settings.enableMaintenanceMode,
      updated_at: new Date().toISOString(),
      updated_by: session.user.email
    };
    
    // Upsert settings
    const { error } = await supabase
      .from('system_settings')
      .upsert(dbSettings);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
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