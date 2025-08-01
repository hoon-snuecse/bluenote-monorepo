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

    // 3. 날짜 설정
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    // 4. 병렬 쿼리 실행
    const [
      dailyStatsResult,
      userCountResult,
      usersResult,
      contentResults,
      gradingResults
    ] = await Promise.all([
      // Daily stats
      supabase
        .from('daily_stats')
        .select('*')
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: true }),
      
      // User count
      supabase
        .from('user_permissions')
        .select('*', { count: 'exact', head: true }),
      
      // User list
      supabase
        .from('user_permissions')
        .select('email, role')
        .limit(15),
      
      // Content stats (all posts queries in parallel)
      Promise.all([
        supabase
          .from('research_posts')
          .select('id, title, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5), // 10 -> 5로 줄임
        supabase
          .from('shed_posts')
          .select('id, title, created_at, date', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('teaching_posts')
          .select('id, title, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('analytics_posts')
          .select('id, title, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5)
      ]),
      
      // Grading stats from external API
      (async () => {
        try {
          const baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://grading.bluenote.site'
            : 'http://localhost:3002';

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 5초 -> 2초로 단축
          
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
          
          return {
            grading: gradingRes.ok ? await gradingRes.json() : null,
            userStats: userStatsRes.ok ? await userStatsRes.json() : null
          };
        } catch (error) {
          console.log('Grading stats fetch failed (non-critical):', error.message);
          return { grading: null, userStats: null };
        }
      })()
    ]);

    // 5. Daily stats 처리
    const { data: dailyStatsData, error: dailyError } = dailyStatsResult;
    if (!dailyError && dailyStatsData) {
      response.dailyStats = dailyStatsData.map(day => ({
        date: new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        fullDate: day.date,
        claude: day.claude_usage_count || 0,
        posts: day.total_post_count || 0,
        logins: day.login_count || 0,
        uniqueLogins: day.unique_login_count || 0
      }));

      dailyStatsData.forEach(day => {
        response.totalLogins += day.login_count || 0;
        response.totalClaudeUsage += day.claude_usage_count || 0;
        
        if (day.date === today.toISOString().split('T')[0]) {
          response.todayLogins = day.login_count || 0;
          response.todayClaudeUsage = day.claude_usage_count || 0;
        }
      });
    }

    // 6. User count 처리
    const { count: totalUserCount, error: countError } = userCountResult;
    if (!countError && totalUserCount !== null) {
      response.totalUsers = totalUserCount;
    }

    // 7. User activity 처리
    const { data: users, error: usersError } = usersResult;
    if (!usersError && users) {
      const userEmails = users.map(u => u.email);
      
      // User daily stats 병렬 쿼리 - 필요한 필드만 선택
      const [todayStatsResult, weekStatsResult, totalStatsResult] = await Promise.all([
        supabase
          .from('user_daily_stats')
          .select('user_email, login_count, last_login_at, last_device, last_browser, grading_sonnet_count, grading_opus_count')
          .in('user_email', userEmails)
          .eq('date', today.toISOString().split('T')[0]),
        
        supabase
          .from('user_daily_stats')
          .select('user_email, login_count, grading_sonnet_count, grading_opus_count')
          .in('user_email', userEmails)
          .gte('date', weekAgo.toISOString().split('T')[0]),
        
        supabase
          .from('user_daily_stats')
          .select('user_email, login_count, grading_sonnet_count, grading_opus_count')
          .in('user_email', userEmails)
      ]);


      const userStatsMap = {};
      
      // Process stats
      if (todayStatsResult.data) {
        todayStatsResult.data.forEach(stat => {
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
      
      if (weekStatsResult.data) {
        weekStatsResult.data.forEach(stat => {
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
      
      if (totalStatsResult.data) {
        totalStatsResult.data.forEach(stat => {
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

    // 8. Content stats 처리
    const [researchResult, shedResult, teachingResult, analyticsResult] = contentResults;
    
    console.log('[Analytics] Content query results:', {
      research: { count: researchResult.count, data: researchResult.data?.length, error: researchResult.error },
      shed: { count: shedResult.count, data: shedResult.data?.length, error: shedResult.error },
      teaching: { count: teachingResult.count, data: teachingResult.data?.length, error: teachingResult.error },
      analytics: { count: analyticsResult.count, data: analyticsResult.data?.length, error: analyticsResult.error }
    });
    
    response.contentStats.research = researchResult.count || 0;
    response.contentStats.shed = shedResult.count || 0;
    response.contentStats.teaching = teachingResult.count || 0;
    response.contentStats.analytics = analyticsResult.count || 0;

    // Merge all posts for recent posts
    const allPosts = [];
    
    if (researchResult.data) {
      researchResult.data.forEach(post => {
        allPosts.push({ ...post, section: 'research' });
      });
    }
    
    if (shedResult.data) {
      shedResult.data.forEach(post => {
        allPosts.push({ ...post, section: 'shed' });
      });
    }
    
    if (teachingResult.data) {
      teachingResult.data.forEach(post => {
        allPosts.push({ ...post, section: 'teaching' });
      });
    }
    
    if (analyticsResult.data) {
      analyticsResult.data.forEach(post => {
        allPosts.push({ ...post, section: 'analytics' });
      });
    }
    
    allPosts.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0);
      const dateB = new Date(b.created_at || b.date || 0);
      return dateB - dateA;
    });
    
    response.recentPosts = allPosts.slice(0, 5);

    // 9. Grading stats 처리
    if (gradingResults.grading) {
      const gradingData = gradingResults.grading;
      if (gradingData.evaluations?.byModel) {
        response.totalGradingSonnet = gradingData.evaluations.byModel.sonnet?.total || 0;
        response.todayGradingSonnet = gradingData.evaluations.byModel.sonnet?.today || 0;
        response.totalGradingOpus = gradingData.evaluations.byModel.opus?.total || 0;
        response.todayGradingOpus = gradingData.evaluations.byModel.opus?.today || 0;
      }
    }
    
    if (gradingResults.userStats?.userStats) {
      const userEntries = Object.entries(gradingResults.userStats.userStats);
      
      response.userActivity.forEach(user => {
        if (gradingResults.userStats.userStats[user.email]) {
          user.gradingStats.sonnet = gradingResults.userStats.userStats[user.email].sonnet || 0;
          user.gradingStats.opus = gradingResults.userStats.userStats[user.email].opus || 0;
        }
      });
      
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

    // 10. Performance metrics
    const endTime = Date.now();
    const performanceMetrics = {
      totalTime: endTime - startTime,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ 
      stats: response,
      performanceMetrics 
    });

  } catch (error) {
    console.error('Analytics Optimized API Error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}