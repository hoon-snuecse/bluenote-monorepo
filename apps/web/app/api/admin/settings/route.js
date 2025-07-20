import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Fetch settings from database
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // Return settings or default values
    return NextResponse.json({
      settings: data || {
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
      }
    });
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
    const supabase = createClient();
    
    // Upsert settings
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        id: 1, // Single row for system settings
        ...settings,
        updated_at: new Date().toISOString(),
        updated_by: session.user.email
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}