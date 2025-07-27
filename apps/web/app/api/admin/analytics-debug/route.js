import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const debugInfo = {
    step: 'start',
    errors: []
  };

  try {
    // 1. 세션 확인
    debugInfo.step = 'session-check';
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Not admin' }, { status: 401 });
    }

    debugInfo.sessionOk = true;

    // 2. Supabase 클라이언트 생성
    debugInfo.step = 'supabase-init';
    const supabase = createAdminClient();
    
    // 3. 날짜 계산
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 4. 사용자 목록 가져오기
    debugInfo.step = 'fetch-users';
    const { data: users, error: usersError } = await supabase
      .from('user_permissions')
      .select('email, role, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      debugInfo.errors.push({ step: 'users', error: usersError.message });
    }

    // 5. 로그 가져오기
    debugInfo.step = 'fetch-logs';
    const { data: logs, error: logsError } = await supabase
      .from('usage_logs')
      .select('action_type, user_email, created_at, metadata')
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (logsError) {
      debugInfo.errors.push({ step: 'logs', error: logsError.message });
    }

    // 6. 기본 통계 계산
    debugInfo.step = 'calculate-stats';
    const loginLogs = logs?.filter(log => log.action_type === 'login') || [];
    const claudeLogs = logs?.filter(log => log.action_type === 'claude_chat') || [];
    
    const todayString = today.toDateString();
    const todayLogins = loginLogs.filter(log => 
      new Date(log.created_at).toDateString() === todayString
    ).length;
    const todayClaudeUsage = claudeLogs.filter(log => 
      new Date(log.created_at).toDateString() === todayString
    ).length;

    // 7. 응답 생성
    return NextResponse.json({
      success: true,
      debugInfo,
      stats: {
        totalUsers: users?.length || 0,
        totalLogins: loginLogs.length,
        todayLogins,
        totalClaudeUsage: claudeLogs.length,
        todayClaudeUsage,
        // 기본값으로 설정
        totalGradingSonnet: 0,
        todayGradingSonnet: 0,
        totalGradingOpus: 0,
        todayGradingOpus: 0,
        userActivity: [],
        recentPosts: [],
        contentStats: {
          research: 0,
          teaching: 0,
          analytics: 0,
          shed: 0
        },
        sonnetTopUsers: [],
        opusTopUsers: [],
        dailyStats: []
      }
    });

  } catch (error) {
    console.error('Analytics Debug API Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      debugInfo,
      errorMessage: error.message,
      errorStack: error.stack
    }, { status: 500 });
  }
}