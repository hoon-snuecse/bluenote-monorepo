import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Service Role 클라이언트 사용
    const supabase = createAdminClient();
    
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

    // 3. daily_stats 테이블에서 7일 통계 가져오기
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    
    const { data: dailyStatsData, error: dailyError } = await supabase
      .from('daily_stats')
      .select('*')
      .gte('date', weekAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (!dailyError && dailyStatsData) {
      // 일별 통계 변환
      response.dailyStats = dailyStatsData.map(day => ({
        date: new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        fullDate: day.date,
        claude: day.claude_usage_count || 0,
        posts: day.total_post_count || 0,
        logins: day.login_count || 0,
        uniqueLogins: day.unique_login_count || 0
      }));

      // 누적 통계 계산
      dailyStatsData.forEach(day => {
        response.totalLogins += day.login_count || 0;
        response.totalClaudeUsage += day.claude_usage_count || 0;
        
        // 오늘 통계
        if (day.date === today.toISOString().split('T')[0]) {
          response.todayLogins = day.login_count || 0;
          response.todayClaudeUsage = day.claude_usage_count || 0;
        }
      });
    }

    // 4. 사용자 정보 가져오기 (Service Role 사용)
    // 전체 사용자 수 카운트
    const { count: totalUserCount, error: countError } = await supabase
      .from('user_permissions')
      .select('*', { count: 'exact', head: true });
    
    if (!countError && totalUserCount !== null) {
      response.totalUsers = totalUserCount;
    }
    
    // 사용자 활동 정보를 위한 상세 데이터 (15명만)
    const { data: users, error: usersError } = await supabase
      .from('user_permissions')
      .select('email, role')
      .limit(15);

    if (!usersError && users) {
      // 사용자별 로그인 통계 가져오기
      const userEmails = users.map(u => u.email);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // usage_logs에서 로그인 정보 가져오기
      const { data: loginLogs } = await supabase
        .from('usage_logs')
        .select('user_email, created_at, metadata')
        .eq('action_type', 'login')
        .in('user_email', userEmails)
        .gte('created_at', weekAgo.toISOString());
      
      // 사용자별 통계 계산
      const userStatsMap = {};
      
      if (loginLogs) {
        loginLogs.forEach(log => {
          if (!userStatsMap[log.user_email]) {
            userStatsMap[log.user_email] = {
              total: 0,
              today: 0,
              week: 0,
              lastLogin: null,
              lastDevice: 'Unknown',
              lastBrowser: 'Unknown'
            };
          }
          
          const logDate = new Date(log.created_at);
          userStatsMap[log.user_email].week++;
          
          if (logDate >= today) {
            userStatsMap[log.user_email].today++;
          }
          
          // 가장 최근 로그인 정보 업데이트
          if (!userStatsMap[log.user_email].lastLogin || logDate > new Date(userStatsMap[log.user_email].lastLogin)) {
            userStatsMap[log.user_email].lastLogin = log.created_at;
            
            // metadata에서 디바이스 정보 추출
            if (log.metadata) {
              const metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
              userStatsMap[log.user_email].lastDevice = metadata.device || 'Unknown';
              userStatsMap[log.user_email].lastBrowser = metadata.browser || 'Unknown';
            }
          }
        });
      }
      
      // 전체 로그인 수 가져오기
      const { count: totalLoginCount } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'login')
        .in('user_email', userEmails);
      
      // 사용자별 전체 로그인 수 업데이트
      if (totalLoginCount) {
        const avgLoginPerUser = Math.floor(totalLoginCount / userEmails.length);
        Object.keys(userStatsMap).forEach(email => {
          userStatsMap[email].total = userStatsMap[email].week + avgLoginPerUser;
        });
      }
      
      // 사용자 활동 정보 구성
      response.userActivity = users.map(user => ({
        email: user.email,
        role: user.role,
        loginStats: {
          today: userStatsMap[user.email]?.today || 0,
          week: userStatsMap[user.email]?.week || 0,
          total: userStatsMap[user.email]?.total || 0,
          lastLogin: userStatsMap[user.email]?.lastLogin || null
        },
        gradingStats: {
          sonnet: 0,
          opus: 0
        },
        deviceInfo: {
          device: userStatsMap[user.email]?.lastDevice || 'Unknown',
          browser: userStatsMap[user.email]?.lastBrowser || 'Unknown'
        }
      }));
    }

    // 5. 콘텐츠 통계 및 최근 게시물
    try {
      // Research posts
      const { data: researchPosts, count: researchCount } = await supabase
        .from('research_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      response.contentStats.research = researchCount || 0;

      // Shed posts
      const { data: shedPosts, count: shedCount } = await supabase
        .from('shed_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      response.contentStats.shed = shedCount || 0;

      // Teaching posts
      const { data: teachingPosts, count: teachingCount } = await supabase
        .from('teaching_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      response.contentStats.teaching = teachingCount || 0;

      // Analytics posts
      const { data: analyticsPosts, count: analyticsCount } = await supabase
        .from('analytics_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);
      response.contentStats.analytics = analyticsCount || 0;

      // 모든 게시물을 합쳐서 최근 5개 선택
      const allPosts = [];
      
      if (researchPosts) {
        researchPosts.forEach(post => {
          allPosts.push({ ...post, section: 'research' });
        });
      }
      
      if (shedPosts) {
        shedPosts.forEach(post => {
          allPosts.push({ ...post, section: 'shed' });
        });
      }
      
      if (teachingPosts) {
        teachingPosts.forEach(post => {
          allPosts.push({ ...post, section: 'teaching' });
        });
      }
      
      if (analyticsPosts) {
        analyticsPosts.forEach(post => {
          allPosts.push({ ...post, section: 'analytics' });
        });
      }
      
      // 날짜 기준으로 정렬하고 최근 5개만 선택
      allPosts.sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0);
        const dateB = new Date(b.created_at || b.date || 0);
        return dateB - dateA;
      });
      
      response.recentPosts = allPosts.slice(0, 5);
    } catch (error) {
      console.log('Content stats error:', error.message);
    }

    // 6. 채점 통계 (기존 코드 유지)
    try {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://grading.bluenote.site'
        : 'http://localhost:3002';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const [gradingRes, userStatsRes] = await Promise.all([
        fetch(`${baseUrl}/api/stats`, { 
          cache: 'no-store',
          signal: controller.signal
        }),
        fetch(`${baseUrl}/api/stats/user-evaluations`, { 
          cache: 'no-store',
          signal: controller.signal
        })
      ]);
      
      clearTimeout(timeoutId);

      if (gradingRes.ok) {
        const gradingData = await gradingRes.json();
        
        if (gradingData.evaluations?.byModel) {
          response.totalGradingSonnet = gradingData.evaluations.byModel.sonnet?.total || 0;
          response.todayGradingSonnet = gradingData.evaluations.byModel.sonnet?.today || 0;
          response.totalGradingOpus = gradingData.evaluations.byModel.opus?.total || 0;
          response.todayGradingOpus = gradingData.evaluations.byModel.opus?.today || 0;
        }
      }
      
      if (userStatsRes && userStatsRes.ok) {
        const userStatsData = await userStatsRes.json();
        
        if (userStatsData.userStats) {
          const userEntries = Object.entries(userStatsData.userStats);
          
          response.sonnetTopUsers = userEntries
            .filter(([email, stats]) => stats.sonnet > 0)
            .sort((a, b) => b[1].sonnet - a[1].sonnet)
            .slice(0, 5)
            .map(([email, stats]) => ({
              name: email,
              count: stats.sonnet
            }));
          
          response.opusTopUsers = userEntries
            .filter(([email, stats]) => stats.opus > 0)
            .sort((a, b) => b[1].opus - a[1].opus)
            .slice(0, 5)
            .map(([email, stats]) => ({
              name: email,
              count: stats.opus
            }));
        }
      }
    } catch (error) {
      console.log('Grading stats fetch failed (non-critical):', error.message);
    }

    return NextResponse.json({ stats: response });

  } catch (error) {
    console.error('Analytics Fixed API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}