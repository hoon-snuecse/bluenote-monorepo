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
    
    // 한국 시간대 고려
    const now = new Date();
    const kstOffset = 9 * 60; // KST는 UTC+9
    const localOffset = now.getTimezoneOffset();
    const totalOffset = kstOffset + localOffset;
    const kstNow = new Date(now.getTime() + totalOffset * 60 * 1000);
    
    const today = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate());
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
    
    // 오늘 날짜 범위 설정 (한국 시간 기준)
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    logs.forEach(log => {
      if (log.action_type === 'login') {
        loginLogs.push(log);
      } else if (log.action_type === 'claude_chat') {
        claudeLogs.push(log);
      }
    });

    // 전체 로그인 수 가져오기
    try {
      const { count: totalLoginCount } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'login');
      
      response.totalLogins = totalLoginCount || loginLogs.length;
    } catch (error) {
      console.error('Error fetching total login count:', error);
      response.totalLogins = loginLogs.length;
    }
    
    response.todayLogins = loginLogs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= todayStart && logDate < todayEnd;
    }).length;
    
    // 전체 Claude 사용량 가져오기
    try {
      const { count: totalClaudeCount } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'claude_chat');
      
      response.totalClaudeUsage = totalClaudeCount || claudeLogs.length;
    } catch (error) {
      console.error('Error fetching total claude count:', error);
      response.totalClaudeUsage = claudeLogs.length;
    }
    
    response.todayClaudeUsage = claudeLogs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= todayStart && logDate < todayEnd;
    }).length;

    // 5. 콘텐츠 통계 (직접 REST API 호출로 변경)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        // Research posts count
        const researchRes = await fetch(
          `${SUPABASE_URL}/rest/v1/research_posts?select=*`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'count=exact',
              'Range-Unit': 'items',
              'Range': '0-0'
            }
          }
        );
        
        if (researchRes.ok) {
          const contentRange = researchRes.headers.get('content-range');
          if (contentRange) {
            const match = contentRange.match(/\d+-\d+\/(\d+)/);
            if (match) {
              response.contentStats.research = parseInt(match[1]);
            }
          }
        }
      
        // Teaching posts count
        const teachingRes = await fetch(
          `${SUPABASE_URL}/rest/v1/teaching_posts?select=*`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'count=exact',
              'Range-Unit': 'items',
              'Range': '0-0'
            }
          }
        );
        
        if (teachingRes.ok) {
          const contentRange = teachingRes.headers.get('content-range');
          if (contentRange) {
            const match = contentRange.match(/\d+-\d+\/(\d+)/);
            if (match) {
              response.contentStats.teaching = parseInt(match[1]);
            }
          }
        }

        // Analytics posts count
        const analyticsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/analytics_posts?select=*`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'count=exact',
              'Range-Unit': 'items',
              'Range': '0-0'
            }
          }
        );
        
        if (analyticsRes.ok) {
          const contentRange = analyticsRes.headers.get('content-range');
          if (contentRange) {
            const match = contentRange.match(/\d+-\d+\/(\d+)/);
            if (match) {
              response.contentStats.analytics = parseInt(match[1]);
            }
          }
        }

        // Shed posts count
        const shedRes = await fetch(
          `${SUPABASE_URL}/rest/v1/shed_posts?select=*`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'count=exact',
              'Range-Unit': 'items',
              'Range': '0-0'
            }
          }
        );
        
        if (shedRes.ok) {
          const contentRange = shedRes.headers.get('content-range');
          if (contentRange) {
            const match = contentRange.match(/\d+-\d+\/(\d+)/);
            if (match) {
              response.contentStats.shed = parseInt(match[1]);
            }
          }
        }

        // 최근 게시물 가져오기 (직접 API 호출)
        const recentRes = await fetch(
          `${SUPABASE_URL}/rest/v1/research_posts?select=id,title,created_at&order=created_at.desc&limit=5`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );
        
        if (recentRes.ok) {
          const recentPosts = await recentRes.json();
          recentPosts.forEach(post => {
            response.recentPosts.push({ ...post, section: 'research' });
          });
        }
      } catch (error) {
        console.error('Error fetching content stats:', error);
      }
    }


    // 최근 게시물 정렬 및 제한
    response.recentPosts.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    response.recentPosts = response.recentPosts.slice(0, 5);

    // 6. 일별 통계 계산
    const dailyStats = [];
    
    // 게시물 통계를 위한 날짜별 카운트 - 모든 게시물 가져오기
    const postsByDate = {};
    
    // 7일 이내의 모든 게시물 가져오기
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        // 각 섹션별로 7일 이내 게시물 가져오기
        const sections = ['research_posts', 'teaching_posts', 'analytics_posts', 'shed_posts'];
        
        for (const section of sections) {
          const postsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/${section}?select=created_at&created_at=gte.${weekAgo.toISOString()}&order=created_at.desc`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            }
          );
          
          if (postsRes.ok) {
            const posts = await postsRes.json();
            posts.forEach(post => {
              const postDate = new Date(post.created_at);
              const dateKey = postDate.toISOString().split('T')[0];
              postsByDate[dateKey] = (postsByDate[dateKey] || 0) + 1;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching posts for daily stats:', error);
      }
    }
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= dayStart && logDate < dayEnd;
      });
      
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
        fullDate: dateKey,
        claude: claudeCount,
        posts: postsByDate[dateKey] || 0,
        logins: loginCount,
        uniqueLogins: loginUsers.size
      });
    }
    response.dailyStats = dailyStats;

    // 7. 사용자 활동 (간단한 버전)
    const userActivityMap = {};
    
    // 사용자별 전체 로그인 수 먼저 가져오기
    const userTotalLogins = {};
    try {
      const { data: allUserLogins } = await supabase
        .from('usage_logs')
        .select('user_email')
        .eq('action_type', 'login');
        
      if (allUserLogins) {
        allUserLogins.forEach(log => {
          userTotalLogins[log.user_email] = (userTotalLogins[log.user_email] || 0) + 1;
        });
      }
    } catch (error) {
      console.error('Error fetching user total logins:', error);
    }
    
    // 사용자 활동 맵 생성
    users.forEach(user => {
      userActivityMap[user.email] = {
        email: user.email,
        role: user.role,
        loginStats: {
          today: 0,
          week: 0,
          total: userTotalLogins[user.email] || 0,
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
        
        if (logDate >= todayStart && logDate < todayEnd) {
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
      const baseUrl = process.env.GRADING_API_URL || (
        process.env.NODE_ENV === 'production'
          ? 'https://grading.bluenote.site'
          : 'http://localhost:3002'
      );

      console.log('Fetching grading stats from:', `${baseUrl}/api/stats`);
      
      // Node.js fetch를 사용하여 더 안정적으로 처리
      const gradingRes = await fetch(`${baseUrl}/api/stats`, { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bluenote-Web/1.0'
        }
      }).catch(error => {
        console.error('Fetch error:', error);
        return null;
      });

      if (!gradingRes) {
        console.error('Grading API fetch returned null');
        throw new Error('Failed to fetch grading stats');
      }
      
      console.log('Grading API fetch completed:', {
        ok: gradingRes.ok,
        status: gradingRes.status
      });
      
      if (gradingRes.ok) {
        const gradingText = await gradingRes.text();
        console.log('Grading API raw response:', gradingText);
        
        let gradingData;
        try {
          gradingData = JSON.parse(gradingText);
        } catch (e) {
          console.error('Failed to parse grading response:', e);
          throw new Error('Invalid JSON response from grading API');
        }
        
        console.log('Grading API parsed data:', gradingData);
        
        if (gradingData.evaluations?.byModel) {
          response.totalGradingSonnet = gradingData.evaluations.byModel.sonnet?.total || 0;
          response.todayGradingSonnet = gradingData.evaluations.byModel.sonnet?.today || 0;
          response.totalGradingOpus = gradingData.evaluations.byModel.opus?.total || 0;
          response.todayGradingOpus = gradingData.evaluations.byModel.opus?.today || 0;
          
          console.log('Grading stats set:', {
            totalSonnet: response.totalGradingSonnet,
            todaySonnet: response.todayGradingSonnet,
            totalOpus: response.totalGradingOpus,
            todayOpus: response.todayGradingOpus
          });
        }
      } else {
        const errorText = await gradingRes.text();
        console.error('Grading API failed:', {
          status: gradingRes.status,
          statusText: gradingRes.statusText,
          errorText: errorText,
          url: `${baseUrl}/api/stats`
        });
      }
      
      // 사용자별 채점 통계 가져오기
      const userStatsRes = await fetch(`${baseUrl}/api/stats/user-evaluations`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bluenote-Web/1.0'
        }
      }).catch(error => {
        console.error('User stats fetch error:', error);
        return null;
      });
      
      if (userStatsRes && userStatsRes.ok) {
        const userStatsData = await userStatsRes.json();
        console.log('User stats response:', userStatsData);
        
        // 사용자 활동에 채점 통계 병합
        if (userStatsData.userStats) {
          Object.entries(userStatsData.userStats).forEach(([email, stats]) => {
            const userIndex = response.userActivity.findIndex(u => u.email === email);
            if (userIndex !== -1) {
              response.userActivity[userIndex].gradingStats = stats;
            }
          });
        }
        
        // Top users 계산
        const userEntries = Object.entries(userStatsData.userStats || {});
        
        response.sonnetTopUsers = userEntries
          .filter(([_, stats]) => stats.sonnet > 0)
          .sort((a, b) => b[1].sonnet - a[1].sonnet)
          .slice(0, 5)
          .map(([email, stats]) => ({
            name: email.split('@')[0],
            count: stats.sonnet
          }));
          
        response.opusTopUsers = userEntries
          .filter(([_, stats]) => stats.opus > 0)
          .sort((a, b) => b[1].opus - a[1].opus)
          .slice(0, 5)
          .map(([email, stats]) => ({
            name: email.split('@')[0],
            count: stats.opus
          }));
      }
    } catch (error) {
      console.error('Grading stats fetch failed:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // 기본값 설정
      response.totalGradingSonnet = 0;
      response.todayGradingSonnet = 0;
      response.totalGradingOpus = 0;
      response.todayGradingOpus = 0;
    }

    // 디버깅용 로그
    console.log('Analytics Safe API Response:', {
      totalUsers: response.totalUsers,
      totalLogins: response.totalLogins,
      totalClaudeUsage: response.totalClaudeUsage,
      contentStats: response.contentStats,
      recentPostsCount: response.recentPosts.length,
      dailyStatsCount: response.dailyStats.length,
      userActivityCount: response.userActivity.length,
      gradingStats: {
        totalSonnet: response.totalGradingSonnet,
        todaySonnet: response.todayGradingSonnet,
        totalOpus: response.totalGradingOpus,
        todayOpus: response.todayGradingOpus
      }
    });
    
    return NextResponse.json({ stats: response });

  } catch (error) {
    console.error('Analytics Safe API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}