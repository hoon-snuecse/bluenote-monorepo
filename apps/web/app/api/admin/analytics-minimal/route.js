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

    return NextResponse.json({ stats: response });

  } catch (error) {
    console.error('Analytics Minimal API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}