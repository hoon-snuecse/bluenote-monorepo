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
    const { data: users, error: usersError } = await supabase
      .from('user_permissions')
      .select('email, role')
      .limit(15);

    if (!usersError && users) {
      response.totalUsers = users.length;
      
      // 사용자 활동 정보 구성
      response.userActivity = users.map(user => ({
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
      }));
    }

    // 5. 콘텐츠 통계 (공개 테이블은 Anon Key로도 가능)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      // Research posts 카운트
      const { count: researchCount } = await supabase
        .from('research_posts')
        .select('*', { count: 'exact', head: true });
      response.contentStats.research = researchCount || 0;

      // Shed posts 카운트
      const { count: shedCount } = await supabase
        .from('shed_posts')
        .select('*', { count: 'exact', head: true });
      response.contentStats.shed = shedCount || 0;

      // Teaching posts 카운트
      const { count: teachingCount } = await supabase
        .from('teaching_posts')
        .select('*', { count: 'exact', head: true });
      response.contentStats.teaching = teachingCount || 0;

      // Analytics posts 카운트
      const { count: analyticsCount } = await supabase
        .from('analytics_posts')
        .select('*', { count: 'exact', head: true });
      response.contentStats.analytics = analyticsCount || 0;
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