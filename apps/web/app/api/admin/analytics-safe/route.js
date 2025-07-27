import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // 1. 세션 확인
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.error('Session error:', error);
      return NextResponse.json({ 
        error: 'Session error', 
        details: error.message 
      }, { status: 500 });
    }
    
    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }
    
    if (!session.user?.isAdmin) {
      return NextResponse.json({ 
        error: 'Not admin',
        user: session.user?.email || 'unknown'
      }, { status: 401 });
    }

    const supabase = createAdminClient();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 기본 응답 구조
    const response = {
      totalUsers: 0,
      totalLogins: 0,
      todayLogins: 0,
      totalClaudeUsage: 0,
      todayClaudeUsage: 0,
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
    };

    // 2. 사용자 데이터 가져오기
    let users = [];
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('email, role, created_at')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        users = data;
        response.totalUsers = users.length;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    // 3. 로그 데이터 가져오기
    let logs = [];
    try {
      const { data, error } = await supabase
        .from('usage_logs')
        .select('action_type, user_email, created_at, metadata')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (!error && data) {
        logs = data;
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }

    // 4. 로그 분석
    const loginLogs = [];
    const claudeLogs = [];
    const todayString = today.toDateString();
    
    logs.forEach(log => {
      if (log.action_type === 'login') {
        loginLogs.push(log);
      } else if (log.action_type === 'claude_chat') {
        claudeLogs.push(log);
      }
    });

    response.totalLogins = loginLogs.length;
    response.todayLogins = loginLogs.filter(log => 
      new Date(log.created_at).toDateString() === todayString
    ).length;
    
    response.totalClaudeUsage = claudeLogs.length;
    response.todayClaudeUsage = claudeLogs.filter(log => 
      new Date(log.created_at).toDateString() === todayString
    ).length;

    // 5. 콘텐츠 통계 (각각 개별적으로 처리)
    try {
      const { data: researchPosts } = await supabase
        .from('research_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (researchPosts) {
        response.contentStats.research = researchPosts.length;
        researchPosts.forEach(post => {
          response.recentPosts.push({ ...post, section: 'research' });
        });
      }
    } catch (error) {
      console.error('Error fetching research posts:', error);
    }

    try {
      const { data: teachingPosts } = await supabase
        .from('teaching_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (teachingPosts) {
        response.contentStats.teaching = teachingPosts.length;
        teachingPosts.forEach(post => {
          response.recentPosts.push({ ...post, section: 'teaching' });
        });
      }
    } catch (error) {
      console.error('Error fetching teaching posts:', error);
    }

    try {
      const { data: analyticsPosts } = await supabase
        .from('analytics_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (analyticsPosts) {
        response.contentStats.analytics = analyticsPosts.length;
        analyticsPosts.forEach(post => {
          response.recentPosts.push({ ...post, section: 'analytics' });
        });
      }
    } catch (error) {
      console.error('Error fetching analytics posts:', error);
    }

    try {
      const { data: shedPosts } = await supabase
        .from('shed_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (shedPosts) {
        response.contentStats.shed = shedPosts.length;
        shedPosts.forEach(post => {
          response.recentPosts.push({ ...post, section: 'shed' });
        });
      }
    } catch (error) {
      console.error('Error fetching shed posts:', error);
    }

    // 최근 게시물 정렬 및 제한
    response.recentPosts.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    response.recentPosts = response.recentPosts.slice(0, 5);

    // 6. 일별 통계 계산
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      const dayLogs = logs.filter(log => 
        new Date(log.created_at).toDateString() === dateString
      );
      
      const loginUsers = new Set();
      let claudeCount = 0;
      let loginCount = 0;

      dayLogs.forEach(log => {
        if (log.action_type === 'login') {
          loginCount++;
          loginUsers.add(log.user_email);
        } else if (log.action_type === 'claude_chat') {
          claudeCount++;
        }
      });

      dailyStats.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        claude: claudeCount,
        posts: 0, // 게시물 작성 로그가 없는 경우
        logins: loginCount,
        uniqueLogins: loginUsers.size
      });
    }
    response.dailyStats = dailyStats;

    // 7. 사용자 활동 (간단한 버전)
    const userActivityMap = {};
    
    users.forEach(user => {
      userActivityMap[user.email] = {
        email: user.email,
        role: user.role,
        loginStats: {
          today: 0,
          week: 0,
          total: 0,
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

    response.userActivity = Object.values(userActivityMap)
      .sort((a, b) => {
        if (!a.loginStats.lastLogin) return 1;
        if (!b.loginStats.lastLogin) return -1;
        return new Date(b.loginStats.lastLogin) - new Date(a.loginStats.lastLogin);
      })
      .slice(0, 15);

    // 8. Grading 통계 (옵션, 실패해도 무시)
    try {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://grading.bluenote.site'
        : 'http://localhost:3002';

      const gradingRes = await fetch(`${baseUrl}/api/stats/evaluations`, { 
        cache: 'no-store',
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      });

      if (gradingRes.ok) {
        const gradingData = await gradingRes.json();
        if (gradingData.evaluations?.byModel) {
          response.totalGradingSonnet = gradingData.evaluations.byModel.sonnet?.total || 0;
          response.todayGradingSonnet = gradingData.evaluations.byModel.sonnet?.today || 0;
          response.totalGradingOpus = gradingData.evaluations.byModel.opus?.total || 0;
          response.todayGradingOpus = gradingData.evaluations.byModel.opus?.today || 0;
        }
      }
    } catch (error) {
      console.log('Grading stats fetch failed (non-critical):', error.message);
    }

    return NextResponse.json({ stats: response });

  } catch (error) {
    console.error('Analytics Safe API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}