'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowLeft,
  Clock,
  Eye,
  LogIn,
  Bot,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function AdminAnalyticsClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLogins: 0,
    todayLogins: 0,
    totalClaudeUsage: 0,
    todayClaudeUsage: 0,
    totalGradingSonnet: 0,
    todayGradingSonnet: 0,
    totalGradingOpus: 0,
    todayGradingOpus: 0,
    recentUsers: [],
    recentPosts: [],
    contentStats: {
      research: 0,
      teaching: 0,
      analytics: 0,
      shed: 0
    },
    claudeUsageByUser: [],
    dailyStats: []
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user.isAdmin) {
      router.push('/');
      return;
    }

    fetchAnalytics();
  }, [session, status, router]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      
      // Fetch usage logs
      const logsRes = await fetch('/api/admin/usage-logs');
      const logsData = await logsRes.json();
      
      // Fetch content stats
      const contentPromises = ['research', 'teaching', 'analytics', 'shed'].map(async (section) => {
        // 각 섹션별로 올바른 API 경로 사용
        const apiPath = section === 'shed' 
          ? `/api/shed/posts/supabase`
          : `/api/${section}/posts/supabase`;
          
        const res = await fetch(apiPath);
        const data = await res.json();
        return { section, count: data.posts?.length || 0, posts: data.posts || [] };
      });
      const contentResults = await Promise.all(contentPromises);
      
      // Process data
      const contentStats = {};
      let totalPosts = 0;
      const allPosts = [];
      
      contentResults.forEach(result => {
        contentStats[result.section] = result.count;
        totalPosts += result.count;
        result.posts.forEach(post => {
          allPosts.push({ ...post, section: result.section });
        });
      });
      
      // Sort posts by date
      allPosts.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
      const recentPosts = allPosts.slice(0, 5);
      
      // Process Claude usage and login stats
      const today = new Date().toDateString();
      const claudeUsage = logsData.logs?.filter(log => log.action_type === 'claude_chat') || [];
      const todayClaudeUsage = claudeUsage.filter(log => 
        new Date(log.created_at).toDateString() === today
      ).length;
      
      // Process login stats
      const loginLogs = logsData.logs?.filter(log => log.action_type === 'login') || [];
      const todayLoginLogs = loginLogs.filter(log => 
        new Date(log.created_at).toDateString() === today
      );
      const todayLogins = todayLoginLogs.length;
      
      // Fetch grading stats from grading app via server-side API
      let gradingStats = {
        sonnet: { total: 0, today: 0 },
        opus: { total: 0, today: 0 }
      };
      
      try {
        const gradingRes = await fetch('/api/admin/grading-stats');
        if (gradingRes.ok) {
          const gradingData = await gradingRes.json();
          if (gradingData.evaluations?.byModel) {
            gradingStats = {
              sonnet: gradingData.evaluations.byModel.sonnet || { total: 0, today: 0 },
              opus: gradingData.evaluations.byModel.opus || { total: 0, today: 0 }
            };
          }
        }
      } catch (error) {
        console.error('Failed to fetch grading stats:', error);
      }
      
      // Claude usage by user
      const usageByUser = {};
      claudeUsage.forEach(log => {
        if (!usageByUser[log.user_email]) {
          usageByUser[log.user_email] = 0;
        }
        usageByUser[log.user_email]++;
      });
      
      const claudeUsageByUser = Object.entries(usageByUser)
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Daily stats for the last 7 days
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        const dayLogs = logsData.logs?.filter(log => 
          new Date(log.created_at).toDateString() === dateString
        ) || [];
        
        dailyStats.push({
          date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          claude: dayLogs.filter(log => log.action_type === 'claude_chat').length,
          posts: dayLogs.filter(log => log.action_type === 'post_write').length,
          logins: dayLogs.filter(log => log.action_type === 'login').length,
          uniqueLogins: new Set(dayLogs.filter(log => log.action_type === 'login').map(log => log.user_email)).size
        });
      }
      
      setStats({
        totalUsers: usersData.users?.length || 0,
        totalLogins: loginLogs.length,
        todayLogins,
        totalClaudeUsage: claudeUsage.length,
        todayClaudeUsage,
        totalGradingSonnet: gradingStats.sonnet.total,
        todayGradingSonnet: gradingStats.sonnet.today,
        totalGradingOpus: gradingStats.opus.total,
        todayGradingOpus: gradingStats.opus.today,
        recentUsers: usersData.users?.slice(-10).reverse() || [],
        recentPosts,
        contentStats,
        claudeUsageByUser,
        dailyStats
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session || !session.user.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-1.5">
        <h1 className="text-2xl font-bold text-white">통계 및 분석</h1>
        <Link
          href="/admin/dashboard"
          className="flex items-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          관리자 대시보드로
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">전체 사용자</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">로그인</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.todayLogins} / {stats.totalLogins}</p>
              <p className="text-xs text-slate-500 mt-1">오늘 / 총</p>
            </div>
            <LogIn className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">AI 작성(API)</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.todayClaudeUsage} / {stats.totalClaudeUsage}</p>
              <p className="text-xs text-slate-500 mt-1">오늘 / 총</p>
            </div>
            <Bot className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">AI 채점(sonnet)</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.todayGradingSonnet} / {stats.totalGradingSonnet}</p>
              <p className="text-xs text-slate-500 mt-1">오늘 / 총</p>
            </div>
            <GraduationCap className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">AI 채점(opus)</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.todayGradingOpus} / {stats.totalGradingOpus}</p>
              <p className="text-xs text-slate-500 mt-1">오늘 / 총</p>
            </div>
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Content Distribution */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">콘텐츠 분포</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.contentStats).map(([section, count]) => (
            <div key={section} className="text-center">
              <p className="text-slate-400 text-sm">{
                section === 'research' ? '연구' : 
                section === 'teaching' ? '교육' : 
                section === 'analytics' ? '분석' : 
                section === 'shed' ? '일상' : section
              }</p>
              <p className="text-2xl font-bold text-white mt-1">{count}</p>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${stats.totalPosts > 0 ? (count / stats.totalPosts) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">최근 7일 활동</h3>
          <div className="space-y-3">
            {stats.dailyStats.map((day, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-400 text-sm w-16">{day.date}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500"
                          style={{ width: `${day.claude > 0 ? (day.claude / Math.max(...stats.dailyStats.map(d => d.claude), 1)) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs w-16">Claude {day.claude}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500"
                          style={{ width: `${day.posts > 0 ? (day.posts / Math.max(...stats.dailyStats.map(d => d.posts), 1)) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs w-16">게시물 {day.posts}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500"
                          style={{ width: `${day.logins > 0 ? (day.logins / Math.max(...stats.dailyStats.map(d => d.logins), 1)) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs w-16">로그인 {day.logins} ({day.uniqueLogins}명)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded" />
                Claude 사용
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                게시물 작성
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-cyan-500 rounded" />
                로그인
              </span>
            </div>
          </div>
        </div>

        {/* Top Claude Users */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Claude 최다 사용자</h3>
          <div className="space-y-2">
            {stats.claudeUsageByUser.map((user, index) => (
              <div key={user.email} className="flex items-center justify-between p-2 hover:bg-slate-700 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm w-6">#{index + 1}</span>
                  <span className="text-white text-sm">{user.email}</span>
                </div>
                <span className="text-slate-400 text-sm">{user.count}회</span>
              </div>
            ))}
            {stats.claudeUsageByUser.length === 0 && (
              <p className="text-slate-500 text-center py-4">사용 기록이 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">최근 콘텐츠</h3>
        <div className="space-y-3">
          {stats.recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/${post.section}/${post.id}`}
              className="flex items-center justify-between p-3 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{post.title}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-slate-400 text-xs">{
                    post.section === 'research' ? '연구' : 
                    post.section === 'teaching' ? '교육' : 
                    post.section === 'analytics' ? '분석' : 
                    post.section === 'shed' ? '일상' : post.section
                  }</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.created_at || post.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
              <Eye className="w-4 h-4 text-slate-400" />
            </Link>
          ))}
          {stats.recentPosts.length === 0 && (
            <p className="text-slate-500 text-center py-4">최근 콘텐츠가 없습니다</p>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">최근 가입 사용자</h3>
        <div className="space-y-2">
          {stats.recentUsers.map((user) => (
            <div key={user.email} className="flex items-center justify-between p-2">
              <span className="text-white">{user.email}</span>
              <span className="text-slate-400 text-sm">
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          ))}
          {stats.recentUsers.length === 0 && (
            <p className="text-slate-500 text-center py-4">최근 가입자가 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}