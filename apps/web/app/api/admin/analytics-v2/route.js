import { NextResponse } from 'next/server';
// Removed next-auth import
import { checkAuth } from '@/lib/supabase-auth-helpers';

export async function GET() {
  try {
    // 1. 세션 확인
    const { error: authError } = await checkAuth('admin');
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    // 응답 객체 초기화
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

    // 2. 7일 통계 가져오기 (daily_stats 테이블에서)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    
    try {
      const dailyStatsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_stats?select=*&date=gte.${weekAgo.toISOString().split('T')[0]}&order=date.asc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (dailyStatsRes.ok) {
        const dailyStatsData = await dailyStatsRes.json();
        
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
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    }

    // 3. 전체 사용자 수 가져오기 및 사용자 활동 데이터
    let users = [];
    try {
      const usersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/user_permissions?select=email,role,created_at&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (usersRes.ok) {
        users = await usersRes.json();
        response.totalUsers = users.length;
        
        // 사용자 활동 데이터 구성 (임시로 기본값 설정)
        response.userActivity = users.slice(0, 15).map(user => ({
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
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    // 4. 콘텐츠 통계
    const contentTables = ['research_posts', 'teaching_posts', 'analytics_posts', 'shed_posts'];
    for (const table of contentTables) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?select=id`,
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

        if (res.ok) {
          const contentRange = res.headers.get('content-range');
          if (contentRange) {
            const match = contentRange.match(/\d+-\d+\/(\d+)/);
            if (match) {
              const key = table.replace('_posts', '');
              response.contentStats[key] = parseInt(match[1]);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching ${table} count:`, error);
      }
    }

    // 5. 최근 게시물
    try {
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
        response.recentPosts = recentPosts.map(post => ({
          ...post,
          section: 'research'
        }));
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }

    // 6. 채점 통계 (옵션)
    try {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://grading.bluenote.site'
        : 'http://localhost:3002';

      console.log('Fetching grading stats from:', `${baseUrl}/api/stats`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const gradingRes = await fetch(`${baseUrl}/api/stats`, { 
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('Grading API response status:', gradingRes.status);

      if (gradingRes.ok) {
        const gradingData = await gradingRes.json();
        console.log('Grading data:', gradingData);
        
        if (gradingData.evaluations?.byModel) {
          response.totalGradingSonnet = gradingData.evaluations.byModel.sonnet?.total || 0;
          response.todayGradingSonnet = gradingData.evaluations.byModel.sonnet?.today || 0;
          response.totalGradingOpus = gradingData.evaluations.byModel.opus?.total || 0;
          response.todayGradingOpus = gradingData.evaluations.byModel.opus?.today || 0;
          
          console.log('Grading stats set:', {
            sonnet: response.totalGradingSonnet,
            opus: response.totalGradingOpus
          });
        }
      } else {
        console.error('Grading API failed:', gradingRes.status);
      }
    } catch (error) {
      console.log('Grading stats fetch failed (non-critical):', error.message);
    }

    console.log('Final response grading stats:', {
      totalGradingSonnet: response.totalGradingSonnet,
      todayGradingSonnet: response.todayGradingSonnet,
      totalGradingOpus: response.totalGradingOpus,
      todayGradingOpus: response.todayGradingOpus
    });
    
    return NextResponse.json({ stats: response }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Analytics V2 API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}