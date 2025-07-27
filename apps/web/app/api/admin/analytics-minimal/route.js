import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 환경 변수 확인
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
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

    // 3. 최소한의 일별 통계 생성 (7일)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      response.dailyStats.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        claude: 0,
        posts: 0,
        logins: 0,
        uniqueLogins: 0
      });
    }

    // 4. usage_logs 데이터 시도
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const logsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/usage_logs?select=action_type,created_at&created_at=gte.${weekAgo.toISOString()}&order=created_at.desc`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );
        
        if (logsRes.ok) {
          const logs = await logsRes.json();
          
          // 날짜별로 집계
          logs.forEach(log => {
            const logDate = new Date(log.created_at);
            const dateKey = logDate.toISOString().split('T')[0];
            
            const dayStatIndex = response.dailyStats.findIndex(d => d.fullDate === dateKey);
            if (dayStatIndex !== -1) {
              if (log.action_type === 'login') {
                response.dailyStats[dayStatIndex].logins++;
                response.totalLogins++;
              } else if (log.action_type === 'claude_chat') {
                response.dailyStats[dayStatIndex].claude++;
                response.totalClaudeUsage++;
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    }

    // 5. 채점 통계 추가
    try {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://grading.bluenote.site'
        : 'http://localhost:3002';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const gradingRes = await fetch(`${baseUrl}/api/stats`, { 
        cache: 'no-store',
        signal: controller.signal
      });
      
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
    } catch (error) {
      console.log('Grading stats fetch failed (non-critical):', error.message);
    }

    // 6. 사용자 활동 데이터 추가
    try {
      const usersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/user_permissions?select=email,role&limit=15`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (usersRes.ok) {
        const users = await usersRes.json();
        
        // 사용자별 로그인 통계 계산을 위해 전체 로그 가져오기
        const userActivityMap = {};
        
        try {
          const allLogsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/usage_logs?select=action_type,created_at,user_email&order=created_at.desc`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            }
          );
          
          if (allLogsRes.ok) {
            const allLogs = await allLogsRes.json();
            
            allLogs.forEach(log => {
              const userEmail = log.user_email;
              if (userEmail) {
                if (!userActivityMap[userEmail]) {
                  userActivityMap[userEmail] = {
                    totalLogins: 0,
                    weekLogins: 0,
                    todayLogins: 0,
                    lastLogin: null,
                    claudeUsage: 0
                  };
                }
                
                const logDate = new Date(log.created_at);
                const todayStart = new Date(today);
                todayStart.setHours(0, 0, 0, 0);
                
                if (log.action_type === 'login') {
                  userActivityMap[userEmail].totalLogins++;
                  
                  if (logDate >= weekAgo) {
                    userActivityMap[userEmail].weekLogins++;
                  }
                  
                  if (logDate >= todayStart) {
                    userActivityMap[userEmail].todayLogins++;
                  }
                  
                  if (!userActivityMap[userEmail].lastLogin || logDate > new Date(userActivityMap[userEmail].lastLogin)) {
                    userActivityMap[userEmail].lastLogin = log.created_at;
                  }
                } else if (log.action_type === 'claude_chat') {
                  userActivityMap[userEmail].claudeUsage++;
                }
              }
            });
          }
        } catch (logError) {
          console.error('Error fetching user logs:', logError);
        }
        
        response.userActivity = users.map(user => {
          const activity = userActivityMap[user.email] || {};
          return {
            email: user.email,
            role: user.role,
            loginStats: {
              today: activity.todayLogins || 0,
              week: activity.weekLogins || 0,
              total: activity.totalLogins || 0,
              lastLogin: activity.lastLogin || null
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
        
        response.totalUsers = users.length;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    // 7. 콘텐츠 통계 추가
    try {
      // Research posts
      const researchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/research_posts?select=id`,
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

      // Shed posts
      const shedRes = await fetch(
        `${SUPABASE_URL}/rest/v1/shed_posts?select=id`,
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
    } catch (error) {
      console.error('Error fetching content stats:', error);
    }

    return NextResponse.json({ stats: response });

  } catch (error) {
    console.error('Analytics Minimal API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}