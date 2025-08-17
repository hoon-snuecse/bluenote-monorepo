import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  try {
    // Check authentication first
    const authClient = await createRouteHandlerClient();
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.error('[Admin Analytics API] Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check admin permissions
    const { data: permissions } = await authClient
      .from('user_permissions')
      .select('role')
      .eq('email', user.email)
      .single();
    
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
    const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Try to use service role client if available
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      );
    } else {
      supabase = authClient;
    }
    
    const koreaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const todayStart = new Date(koreaTime.setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(koreaTime.setDate(koreaTime.getDate() - 7)).toISOString();
    
    // 모든 데이터를 병렬로 가져오기
    const [
      users,
      researchPosts,
      teachingPosts,
      analyticsPosts,
      shedPosts,
      usageLogs,
      loginLogs
    ] = await Promise.all([
      supabase.from('user_permissions').select('*'),
      supabase.from('research_posts').select('*'),
      supabase.from('teaching_posts').select('*'),
      supabase.from('analytics_posts').select('*'),
      supabase.from('shed_posts').select('*'),
      supabase.from('usage_logs').select('*'),
      supabase.from('login_logs').select('*').order('created_at', { ascending: false })
    ]);
    
    // Combine all posts
    const allPosts = [
      ...(researchPosts.data || []),
      ...(teachingPosts.data || []),
      ...(analyticsPosts.data || []),
      ...(shedPosts.data || [])
    ];
    
    // 최근 포스트 10개
    const recentPosts = allPosts
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
    
    // 통계 계산
    const todayLogins = loginLogs.data?.filter(log => 
      new Date(log.created_at) >= new Date(todayStart)
    ).length || 0;
    
    const todayUsageLogs = usageLogs.data?.filter(log => 
      new Date(log.created_at) >= new Date(todayStart)
    ).length || 0;
    
    // 콘텐츠 통계
    const contentStats = {
      research: researchPosts.data?.length || 0,
      teaching: teachingPosts.data?.length || 0,
      analytics: analyticsPosts.data?.length || 0,
      shed: shedPosts.data?.length || 0
    };
    
    // 일별 통계 (최근 7일)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats.push({
        date: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        fullDate: dateStr,
        claude: usageLogs.data?.filter(log => 
          log.created_at.startsWith(dateStr)
        ).length || 0,
        posts: allPosts.filter(post => 
          post.created_at.startsWith(dateStr)
        ).length || 0,
        logins: loginLogs.data?.filter(log => 
          log.created_at.startsWith(dateStr)
        ).length || 0,
        uniqueLogins: new Set(loginLogs.data?.filter(log => 
          log.created_at.startsWith(dateStr)
        ).map(log => log.user_email)).size || 0
      });
    }
    
    // 사용자별 활동 (상위 15명)
    const userActivity = users.data?.map(user => {
      const userLogins = loginLogs.data?.filter(log => log.user_email === user.email);
      const lastLogin = userLogins?.[0]?.created_at;
      const todayLoginsCount = userLogins?.filter(log => 
        new Date(log.created_at) >= new Date(todayStart)
      ).length || 0;
      const weekLoginsCount = userLogins?.filter(log => 
        new Date(log.created_at) >= new Date(weekStart)
      ).length || 0;
      
      const lastLoginLog = userLogins?.[0];
      
      return {
        email: user.email,
        role: user.role,
        loginStats: {
          today: todayLoginsCount,
          week: weekLoginsCount,
          total: userLogins?.length || 0,
          lastLogin
        },
        gradingStats: {
          sonnet: 0,
          opus: 0
        },
        deviceInfo: {
          device: lastLoginLog?.device_info || 'Unknown',
          browser: lastLoginLog?.browser_info || 'Unknown'
        }
      };
    }).sort((a, b) => b.loginStats.total - a.loginStats.total).slice(0, 15) || [];
    
    const result = {
      totalUsers: users.data?.length || 0,
      totalLogins: loginLogs.data?.length || 0,
      todayLogins,
      totalClaudeUsage: usageLogs.data?.length || 0,
      todayClaudeUsage: todayUsageLogs,
      totalGradingSonnet: 0,
      todayGradingSonnet: 0,
      totalGradingOpus: 0,
      todayGradingOpus: 0,
      contentStats,
      dailyStats,
      recentPosts,
      userActivity,
      sonnetTopUsers: [],
      opusTopUsers: []
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Admin Analytics API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }, { status: 500 });
  }
}