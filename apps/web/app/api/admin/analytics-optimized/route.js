import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 병렬로 모든 데이터 가져오기
    const [
      usersResult,
      logsResult,
      contentResults,
      gradingStatsResult
    ] = await Promise.all([
      // 1. 사용자 목록
      supabase
        .from('user_permissions')
        .select('email, role, created_at')
        .order('created_at', { ascending: false }),
      
      // 2. 사용 로그 (최적화된 쿼리)
      supabase
        .from('usage_logs')
        .select('action_type, user_email, created_at, metadata')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(2000),
      
      // 3. 콘텐츠 통계 (한 번에 가져오기)
      Promise.all([
        supabase.from('research_posts').select('id, title, created_at, category').order('created_at', { ascending: false }).limit(50),
        supabase.from('teaching_posts').select('id, title, created_at, category').order('created_at', { ascending: false }).limit(50),
        supabase.from('analytics_posts').select('id, title, created_at, category').order('created_at', { ascending: false }).limit(50),
        supabase.from('shed_posts').select('id, title, created_at, category').order('created_at', { ascending: false }).limit(50)
      ]),
      
      // 4. Grading 통계
      fetchGradingStats()
    ]);

    // 에러 체크
    if (usersResult.error) throw usersResult.error;
    if (logsResult.error) throw logsResult.error;

    const users = usersResult.data || [];
    const logs = logsResult.data || [];

    // 로그 타입별 분류 (한 번의 순회로 처리)
    const loginLogs = [];
    const claudeLogs = [];
    const postLogs = [];
    
    logs.forEach(log => {
      switch (log.action_type) {
        case 'login':
          loginLogs.push(log);
          break;
        case 'claude_chat':
          claudeLogs.push(log);
          break;
        case 'post_write':
          postLogs.push(log);
          break;
      }
    });

    // 오늘 통계 계산
    const todayString = today.toDateString();
    const todayLogins = loginLogs.filter(log => 
      new Date(log.created_at).toDateString() === todayString
    ).length;
    const todayClaudeUsage = claudeLogs.filter(log => 
      new Date(log.created_at).toDateString() === todayString
    ).length;

    // 전체 로그인 수 (별도 쿼리)
    const { data: totalLoginData } = await supabase
      .from('usage_logs')
      .select('id', { count: 'exact', head: true })
      .eq('action_type', 'login');

    const totalLogins = totalLoginData || 0;

    // 콘텐츠 통계 처리
    const contentStats = {
      research: contentResults[0].data?.length || 0,
      teaching: contentResults[1].data?.length || 0,
      analytics: contentResults[2].data?.length || 0,
      shed: contentResults[3].data?.length || 0
    };

    // 최근 게시물 병합 및 정렬
    const allPosts = [];
    const sections = ['research', 'teaching', 'analytics', 'shed'];
    contentResults.forEach((result, index) => {
      if (result.data) {
        result.data.forEach(post => {
          allPosts.push({ ...post, section: sections[index] });
        });
      }
    });
    
    allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const recentPosts = allPosts.slice(0, 5);

    // 일별 통계 계산 (최적화)
    const dailyStats = calculateDailyStats(logs, 7);

    // 사용자 활동 통계 (최적화)
    const userActivity = await calculateUserActivity(
      users,
      loginLogs,
      totalLogins,
      gradingStatsResult
    );

    // 응답 데이터 구성
    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalLogins,
        todayLogins,
        totalClaudeUsage: claudeLogs.length,
        todayClaudeUsage,
        totalGradingSonnet: gradingStatsResult?.sonnet?.total || 0,
        todayGradingSonnet: gradingStatsResult?.sonnet?.today || 0,
        totalGradingOpus: gradingStatsResult?.opus?.total || 0,
        todayGradingOpus: gradingStatsResult?.opus?.today || 0,
        userActivity: userActivity.slice(0, 15),
        recentPosts,
        contentStats,
        sonnetTopUsers: gradingStatsResult?.sonnetTopUsers || [],
        opusTopUsers: gradingStatsResult?.opusTopUsers || [],
        dailyStats
      }
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Grading 통계 가져오기
async function fetchGradingStats() {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://grading.bluenote.site'
      : 'http://localhost:3002';

    const [statsRes, userStatsRes] = await Promise.all([
      fetch(`${baseUrl}/api/stats/evaluations`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/stats/user-evaluations`, { cache: 'no-store' })
    ]);

    if (!statsRes.ok || !userStatsRes.ok) {
      return null;
    }

    const [statsData, userStatsData] = await Promise.all([
      statsRes.json(),
      userStatsRes.json()
    ]);

    return {
      sonnet: statsData.evaluations?.byModel?.sonnet || { total: 0, today: 0 },
      opus: statsData.evaluations?.byModel?.opus || { total: 0, today: 0 },
      sonnetTopUsers: userStatsData.topUsers?.sonnet || [],
      opusTopUsers: userStatsData.topUsers?.opus || []
    };
  } catch (error) {
    console.error('Failed to fetch grading stats:', error);
    return null;
  }
}

// 일별 통계 계산
function calculateDailyStats(logs, days) {
  const dailyStats = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    const dayLogs = logs.filter(log => 
      new Date(log.created_at).toDateString() === dateString
    );
    
    const loginUsers = new Set();
    let claudeCount = 0;
    let postCount = 0;
    let loginCount = 0;

    dayLogs.forEach(log => {
      switch (log.action_type) {
        case 'login':
          loginCount++;
          loginUsers.add(log.user_email);
          break;
        case 'claude_chat':
          claudeCount++;
          break;
        case 'post_write':
          postCount++;
          break;
      }
    });

    dailyStats.push({
      date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      claude: claudeCount,
      posts: postCount,
      logins: loginCount,
      uniqueLogins: loginUsers.size
    });
  }

  return dailyStats;
}

// 사용자 활동 계산
async function calculateUserActivity(users, loginLogs, totalLogins, gradingStats) {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 전체 로그인 횟수 가져오기 (사용자별)
  const { data: userLoginCounts } = await supabase
    .from('usage_logs')
    .select('user_email')
    .eq('action_type', 'login');

  const totalLoginsByUser = {};
  (userLoginCounts || []).forEach(log => {
    totalLoginsByUser[log.user_email] = (totalLoginsByUser[log.user_email] || 0) + 1;
  });

  // 사용자별 활동 맵 생성
  const userActivityMap = {};
  
  users.forEach(user => {
    userActivityMap[user.email] = {
      email: user.email,
      role: user.role,
      loginStats: {
        today: 0,
        week: 0,
        total: totalLoginsByUser[user.email] || 0,
        lastLogin: null
      },
      gradingStats: {
        sonnet: 0,
        opus: 0
      },
      deviceInfo: {
        device: 'Unknown',
        browser: 'Unknown'
      }
    };
  });

  // 로그인 통계 업데이트
  loginLogs.forEach(log => {
    if (userActivityMap[log.user_email]) {
      const logDate = new Date(log.created_at);
      userActivityMap[log.user_email].loginStats.week++;
      
      if (logDate >= today) {
        userActivityMap[log.user_email].loginStats.today++;
      }
      
      if (!userActivityMap[log.user_email].loginStats.lastLogin || 
          logDate > new Date(userActivityMap[log.user_email].loginStats.lastLogin)) {
        userActivityMap[log.user_email].loginStats.lastLogin = log.created_at;
      }
    }
  });

  // Grading 통계 병합
  if (gradingStats?.userStats) {
    Object.entries(gradingStats.userStats).forEach(([email, stats]) => {
      if (userActivityMap[email]) {
        userActivityMap[email].gradingStats = stats;
      }
    });
  }

  // 배열로 변환하고 정렬
  return Object.values(userActivityMap)
    .sort((a, b) => {
      if (!a.loginStats.lastLogin) return 1;
      if (!b.loginStats.lastLogin) return -1;
      return new Date(b.loginStats.lastLogin) - new Date(a.loginStats.lastLogin);
    });
}