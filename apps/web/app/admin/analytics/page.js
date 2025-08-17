import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminAnalyticsClient from './AdminAnalyticsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: '통계 및 분석 - 관리자',
  description: '사용자 활동 및 시스템 통계 분석'
};

async function getAnalyticsData(fallbackClient = null) {
  try {
    let supabase;
    
    // Try to use admin client, fallback to regular client if service key not available
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        supabase = createAdminClient();
      } else {
        console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using fallback client');
        supabase = fallbackClient;
        if (!supabase) {
          return {
            stats: {
              totalUsers: 0,
              totalPosts: 0,
              todayLogins: 0,
              todayClaudeUsage: 0,
              todayGradingSonnet: 0,
              todayGradingHaiku: 0,
              weeklyActive: 0,
              averageLoginPerDay: 0
            },
            charts: {
              dailyLogins: [],
              claudeUsage: [],
              gradingUsage: [],
              deviceTypes: []
            },
            recentActivity: []
          };
        }
      }
    } catch (adminError) {
      console.error('Error creating admin client:', adminError);
      supabase = fallbackClient;
      if (!supabase) {
        return {
          stats: {
            totalUsers: 0,
            totalPosts: 0,
            todayLogins: 0,
            todayClaudeUsage: 0,
            todayGradingSonnet: 0,
            todayGradingHaiku: 0,
            weeklyActive: 0,
            averageLoginPerDay: 0
          },
          charts: {
            dailyLogins: [],
            claudeUsage: [],
            gradingUsage: [],
            deviceTypes: []
          },
          recentActivity: []
        };
      }
    }
    
    const koreaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const todayStart = new Date(koreaTime.setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(koreaTime.setDate(koreaTime.getDate() - 7)).toISOString();
    
    // 모든 데이터를 병렬로 가져오기
    const [
      users,
      posts,
      claudeLogs,
      gradingLogs,
      loginLogs,
      recentPosts
    ] = await Promise.all([
      supabase.from('user_permissions').select('*'),
      supabase.from('posts').select('*'),
      supabase.from('claude_usage_logs').select('*'),
      supabase.from('grading_logs').select('*'),
      supabase.from('login_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(10)
    ]);
    
    
    // 통계 계산
    const todayLogins = loginLogs.data?.filter(log => 
      new Date(log.created_at) >= new Date(todayStart)
    ).length || 0;
    
    const todayClaudeUsage = claudeLogs.data?.filter(log => 
      new Date(log.created_at) >= new Date(todayStart)
    ).length || 0;
    
    const todayGradingSonnet = gradingLogs.data?.filter(log => 
      log.model === 'sonnet' && new Date(log.created_at) >= new Date(todayStart)
    ).length || 0;
    
    const todayGradingOpus = gradingLogs.data?.filter(log => 
      log.model === 'opus' && new Date(log.created_at) >= new Date(todayStart)
    ).length || 0;
    
    // 콘텐츠 통계
    const contentStats = posts.data?.reduce((acc, post) => {
      acc[post.section] = (acc[post.section] || 0) + 1;
      return acc;
    }, {}) || {};
    
    // 일별 통계 (최근 7일)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats.push({
        date: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        fullDate: dateStr,
        claude: claudeLogs.data?.filter(log => 
          log.created_at.startsWith(dateStr)
        ).length || 0,
        posts: posts.data?.filter(post => 
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
    
    // 사용자별 활동
    const userActivity = users.data?.map(user => {
      const userLogins = loginLogs.data?.filter(log => log.user_email === user.email);
      const lastLogin = userLogins?.[0]?.created_at;
      const todayLoginsCount = userLogins?.filter(log => 
        new Date(log.created_at) >= new Date(todayStart)
      ).length || 0;
      const weekLoginsCount = userLogins?.filter(log => 
        new Date(log.created_at) >= new Date(weekStart)
      ).length || 0;
      
      const sonnetCount = gradingLogs.data?.filter(log => 
        log.user_email === user.email && log.model === 'sonnet'
      ).length || 0;
      
      const opusCount = gradingLogs.data?.filter(log => 
        log.user_email === user.email && log.model === 'opus'
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
          sonnet: sonnetCount,
          opus: opusCount
        },
        deviceInfo: {
          device: lastLoginLog?.device_info || 'Unknown',
          browser: lastLoginLog?.browser_info || 'Unknown'
        }
      };
    }).sort((a, b) => b.loginStats.total - a.loginStats.total).slice(0, 15) || [];
    
    // 모델별 상위 사용자
    const sonnetUsers = {};
    const opusUsers = {};
    
    gradingLogs.data?.forEach(log => {
      if (log.model === 'sonnet') {
        sonnetUsers[log.user_email] = (sonnetUsers[log.user_email] || 0) + 1;
      } else if (log.model === 'opus') {
        opusUsers[log.user_email] = (opusUsers[log.user_email] || 0) + 1;
      }
    });
    
    const sonnetTopUsers = Object.entries(sonnetUsers)
      .map(([email, count]) => ({ name: email.split('@')[0], count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const opusTopUsers = Object.entries(opusUsers)
      .map(([email, count]) => ({ name: email.split('@')[0], count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const result = {
      totalUsers: users.data?.length || 0,
      totalLogins: loginLogs.data?.length || 0,
      todayLogins,
      totalClaudeUsage: claudeLogs.data?.length || 0,
      todayClaudeUsage,
      totalGradingSonnet: gradingLogs.data?.filter(log => log.model === 'sonnet').length || 0,
      todayGradingSonnet,
      totalGradingOpus: gradingLogs.data?.filter(log => log.model === 'opus').length || 0,
      todayGradingOpus,
      contentStats,
      dailyStats,
      recentPosts: recentPosts.data || [],
      userActivity,
      sonnetTopUsers,
      opusTopUsers
    };
    
    return result;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return null;
  }
}

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 pb-8">
          <div className="text-center py-8 text-white">인증이 필요합니다.</div>
        </div>
      </div>
    );
  }
  
  // 권한 확인
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('role')
    .eq('email', user.email)
    .single();
  
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 pb-8">
          <div className="text-center py-8 text-white">관리자 권한이 필요합니다.</div>
        </div>
      </div>
    );
  }
  
  const stats = await getAnalyticsData(supabase);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 pb-8">
        <AdminAnalyticsClient initialStats={stats} />
      </div>
    </div>
  );
}