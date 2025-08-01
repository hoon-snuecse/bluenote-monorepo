import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Service Role 클라이언트 생성
    const supabase = createAdminClient();
    
    // 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weekAgoForLogin = new Date(today);
    weekAgoForLogin.setDate(weekAgoForLogin.getDate() - 7);
    
    // 3. 모든 쿼리를 병렬로 실행
    const [
      // 일별 통계 (최근 7일)
      dailyStatsResult,
      // 전체 사용자 수
      userCountResult,
      // 사용자 활동 (상위 15명)
      usersResult,
      // 콘텐츠 통계
      contentStatsResult,
      // Grading 앱 통계
      gradingStatsResult
    ] = await Promise.all([
      // 일별 통계
      supabase
        .from('daily_stats')
        .select('*')
        .gte('date', weekAgoStr)
        .order('date', { ascending: true }),
      
      // 전체 사용자 수
      supabase
        .from('user_permissions')
        .select('*', { count: 'exact', head: true }),
      
      // 사용자 정보와 통계를 한 번에 가져오기
      supabase
        .from('user_permissions')
        .select(`
          email,
          role,
          user_daily_stats!inner (
            date,
            login_count,
            grading_sonnet_count,
            grading_opus_count,
            last_login_at,
            last_device,
            last_browser
          )
        `)
        .order('user_daily_stats(last_login_at)', { ascending: false })
        .limit(15),
      
      // 콘텐츠 통계를 병렬로 가져오기
      Promise.all([
        supabase.from('research_posts').select('id, title, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
        supabase.from('shed_posts').select('id, title, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
        supabase.from('teaching_posts').select('id, title, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
        supabase.from('analytics_posts').select('id, title, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5)
      ]),
      
      // Grading 앱 통계
      fetch(`${process.env.NEXT_PUBLIC_GRADING_APP_URL || 'https://grading.bluenote.site'}/api/stats/users`, {
        headers: {
          'Authorization': `Bearer ${process.env.GRADING_API_KEY || process.env.NEXT_PUBLIC_API_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 } // 1분 캐시
      }).then(res => res.ok ? res.json() : { userStats: {} }).catch(() => ({ userStats: {} }))
    ]);

    // 응답 데이터 구성
    const response = {
      stats: {
        totalUsers: userCountResult.count || 0,
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
      },
      performanceMetrics: {
        queryTime: 0,
        totalTime: 0
      }
    };

    // 일별 통계 처리
    if (!dailyStatsResult.error && dailyStatsResult.data) {
      response.stats.dailyStats = dailyStatsResult.data.map(day => ({
        date: new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        fullDate: day.date,
        claude: day.claude_usage_count || 0,
        posts: day.total_post_count || 0,
        logins: day.login_count || 0,
        uniqueLogins: day.unique_login_count || 0
      }));

      // 누적 통계 계산
      dailyStatsResult.data.forEach(day => {
        response.stats.totalLogins += day.login_count || 0;
        response.stats.totalClaudeUsage += day.claude_usage_count || 0;
        
        if (day.date === todayStr) {
          response.stats.todayLogins = day.login_count || 0;
          response.stats.todayClaudeUsage = day.claude_usage_count || 0;
        }
      });
    }

    // 사용자 활동 처리
    if (!usersResult.error && usersResult.data) {
      const userStatsMap = {};
      
      // 사용자별 통계 집계
      usersResult.data.forEach(user => {
        const stats = {
          today: 0,
          week: 0,
          total: 0,
          lastLogin: null,
          lastDevice: 'Unknown',
          lastBrowser: 'Unknown',
          gradingSonnet: 0,
          gradingOpus: 0
        };
        
        // user_daily_stats 데이터 처리
        if (user.user_daily_stats && user.user_daily_stats.length > 0) {
          user.user_daily_stats.forEach(dailyStat => {
            const statDate = new Date(dailyStat.date);
            
            // 오늘 통계
            if (dailyStat.date === todayStr) {
              stats.today = dailyStat.login_count || 0;
              stats.lastLogin = dailyStat.last_login_at;
              stats.lastDevice = dailyStat.last_device || 'Unknown';
              stats.lastBrowser = dailyStat.last_browser || 'Unknown';
            }
            
            // 주간 통계
            if (statDate >= weekAgoForLogin) {
              stats.week += dailyStat.login_count || 0;
            }
            
            // 전체 통계
            stats.total += dailyStat.login_count || 0;
            stats.gradingSonnet += dailyStat.grading_sonnet_count || 0;
            stats.gradingOpus += dailyStat.grading_opus_count || 0;
          });
          
          // 가장 최근 로그인 정보
          const latestStat = user.user_daily_stats[0];
          if (latestStat) {
            stats.lastLogin = stats.lastLogin || latestStat.last_login_at;
            stats.lastDevice = stats.lastDevice === 'Unknown' ? (latestStat.last_device || 'Unknown') : stats.lastDevice;
            stats.lastBrowser = stats.lastBrowser === 'Unknown' ? (latestStat.last_browser || 'Unknown') : stats.lastBrowser;
          }
        }
        
        userStatsMap[user.email] = stats;
      });
      
      // Grading 앱 통계 병합
      if (gradingStatsResult.userStats) {
        Object.entries(gradingStatsResult.userStats).forEach(([email, gradingStats]) => {
          if (userStatsMap[email]) {
            userStatsMap[email].gradingSonnet = gradingStats.sonnet || userStatsMap[email].gradingSonnet;
            userStatsMap[email].gradingOpus = gradingStats.opus || userStatsMap[email].gradingOpus;
          } else {
            // Grading 앱에만 있는 사용자 추가
            userStatsMap[email] = {
              today: 0,
              week: 0,
              total: 0,
              lastLogin: null,
              lastDevice: 'Unknown',
              lastBrowser: 'Unknown',
              gradingSonnet: gradingStats.sonnet || 0,
              gradingOpus: gradingStats.opus || 0
            };
          }
        });
      }
      
      // 사용자 활동 배열 생성
      response.stats.userActivity = Object.entries(userStatsMap).map(([email, stats]) => ({
        email,
        role: usersResult.data.find(u => u.email === email)?.role || 'user',
        loginStats: {
          today: stats.today,
          week: stats.week,
          total: stats.total,
          lastLogin: stats.lastLogin
        },
        gradingStats: {
          sonnet: stats.gradingSonnet,
          opus: stats.gradingOpus
        },
        deviceInfo: {
          device: stats.lastDevice,
          browser: stats.lastBrowser
        }
      }));
    }

    // 콘텐츠 통계 처리
    if (contentStatsResult) {
      const [research, shed, teaching, analytics] = contentStatsResult;
      
      response.stats.contentStats = {
        research: research.count || 0,
        teaching: teaching.count || 0,
        analytics: analytics.count || 0,
        shed: shed.count || 0
      };
      
      // 최근 게시물 병합 및 정렬
      const allPosts = [];
      
      if (research.data) {
        research.data.forEach(post => {
          allPosts.push({ ...post, section: 'research' });
        });
      }
      if (shed.data) {
        shed.data.forEach(post => {
          allPosts.push({ ...post, section: 'shed' });
        });
      }
      if (teaching.data) {
        teaching.data.forEach(post => {
          allPosts.push({ ...post, section: 'teaching' });
        });
      }
      if (analytics.data) {
        analytics.data.forEach(post => {
          allPosts.push({ ...post, section: 'analytics' });
        });
      }
      
      // 날짜순 정렬 후 상위 5개 선택
      response.stats.recentPosts = allPosts
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    }

    // Grading 통계 집계
    response.stats.userActivity.forEach(user => {
      response.stats.totalGradingSonnet += user.gradingStats.sonnet;
      response.stats.totalGradingOpus += user.gradingStats.opus;
    });

    // 모델별 상위 사용자
    const sonnetUsers = response.stats.userActivity
      .filter(u => u.gradingStats.sonnet > 0)
      .sort((a, b) => b.gradingStats.sonnet - a.gradingStats.sonnet)
      .slice(0, 5);
    
    const opusUsers = response.stats.userActivity
      .filter(u => u.gradingStats.opus > 0)
      .sort((a, b) => b.gradingStats.opus - a.gradingStats.opus)
      .slice(0, 5);
    
    response.stats.sonnetTopUsers = sonnetUsers.map(u => ({
      name: u.email.split('@')[0],
      count: u.gradingStats.sonnet
    }));
    
    response.stats.opusTopUsers = opusUsers.map(u => ({
      name: u.email.split('@')[0],
      count: u.gradingStats.opus
    }));

    // 성능 측정
    const endTime = Date.now();
    response.performanceMetrics = {
      queryTime: endTime - startTime,
      totalTime: endTime - startTime
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}