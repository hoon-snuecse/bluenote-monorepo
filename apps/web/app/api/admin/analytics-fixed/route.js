import { NextResponse } from 'next/server';
// Removed next-auth import
import { checkAuth } from '@/lib/supabase-auth-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // 1. 세션 확인
    const { error: authError } = await checkAuth('admin');
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    // 2. Service Role 클라이언트 사용
    let supabase;
    try {
      supabase = createAdminClient();
    } catch (error) {
      console.error('Failed to create admin client:', error);
      return NextResponse.json(
        { error: 'Service configuration error', message: error.message },
        { status: 500 }
      );
    }
    
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
      // user_daily_stats 테이블에서 사용자별 통계 가져오기
      const userEmails = users.map(u => u.email);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // 오늘 통계
      const { data: todayStats } = await supabase
        .from('user_daily_stats')
        .select('*')
        .in('user_email', userEmails)
        .eq('date', today.toISOString().split('T')[0]);
      
      // 지난 7일 통계
      const { data: weekStats } = await supabase
        .from('user_daily_stats')
        .select('user_email, login_count, grading_sonnet_count, grading_opus_count')
        .in('user_email', userEmails)
        .gte('date', weekAgo.toISOString().split('T')[0]);
      
      // 전체 기간 통계
      const { data: totalStats } = await supabase
        .from('user_daily_stats')
        .select('user_email, login_count, grading_sonnet_count, grading_opus_count')
        .in('user_email', userEmails);
      
      // 통계 집계
      const userStatsMap = {};
      
      // 오늘 통계 맵핑
      if (todayStats) {
        todayStats.forEach(stat => {
          userStatsMap[stat.user_email] = {
            today: stat.login_count || 0,
            week: 0,
            total: 0,
            lastLogin: stat.last_login_at,
            lastDevice: stat.last_device || 'Unknown',
            lastBrowser: stat.last_browser || 'Unknown',
            gradingSonnet: stat.grading_sonnet_count || 0,
            gradingOpus: stat.grading_opus_count || 0
          };
        });
      }
      
      // 주간 통계 집계
      if (weekStats) {
        weekStats.forEach(stat => {
          if (!userStatsMap[stat.user_email]) {
            userStatsMap[stat.user_email] = {
              today: 0, week: 0, total: 0,
              lastLogin: null, lastDevice: 'Unknown', lastBrowser: 'Unknown',
              gradingSonnet: 0, gradingOpus: 0
            };
          }
          userStatsMap[stat.user_email].week += stat.login_count || 0;
        });
      }
      
      // 전체 통계 집계
      if (totalStats) {
        totalStats.forEach(stat => {
          if (!userStatsMap[stat.user_email]) {
            userStatsMap[stat.user_email] = {
              today: 0, week: 0, total: 0,
              lastLogin: null, lastDevice: 'Unknown', lastBrowser: 'Unknown',
              gradingSonnet: 0, gradingOpus: 0
            };
          }
          userStatsMap[stat.user_email].total += stat.login_count || 0;
          userStatsMap[stat.user_email].gradingSonnet += stat.grading_sonnet_count || 0;
          userStatsMap[stat.user_email].gradingOpus += stat.grading_opus_count || 0;
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
          sonnet: userStatsMap[user.email]?.gradingSonnet || 0,
          opus: userStatsMap[user.email]?.gradingOpus || 0
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
      
      // 디버깅용 로그
      console.log('Content fetch results:', {
        researchCount: researchPosts?.length || 0,
        shedCount: shedPosts?.length || 0,
        teachingCount: teachingPosts?.length || 0,
        analyticsCount: analyticsPosts?.length || 0,
        totalPosts: allPosts.length,
        recentPostsCount: response.recentPosts.length
      });
    } catch (error) {
      console.error('Content stats error:', error.message);
      // 더 자세한 에러 정보 추가
      response.contentError = error.message;
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
          
          // Merge grading stats from grading app into user activity
          response.userActivity.forEach(user => {
            if (userStatsData.userStats[user.email]) {
              user.gradingStats.sonnet = userStatsData.userStats[user.email].sonnet || 0;
              user.gradingStats.opus = userStatsData.userStats[user.email].opus || 0;
            }
          });
          
          // Also add grading app users not in the current list
          userEntries.forEach(([email, stats]) => {
            if (!response.userActivity.find(u => u.email === email)) {
              response.userActivity.push({
                email: email,
                role: 'user',
                loginStats: {
                  today: 0,
                  week: 0,
                  total: 0,
                  lastLogin: null
                },
                gradingStats: {
                  sonnet: stats.sonnet || 0,
                  opus: stats.opus || 0
                },
                deviceInfo: {
                  device: 'Unknown',
                  browser: 'Unknown'
                }
              });
            }
          });
          
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
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}