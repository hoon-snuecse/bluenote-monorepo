'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Edit, 
  Trash2,
  Activity,
  TrendingUp,
  Calendar,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user.isAdmin) {
      router.push('/');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (!session || !session.user.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Navigation Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/users" className="quote-sheet hover:shadow-lg transition-all group">
          <div className="relative">
            <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">사용자 관리</h2>
                  <p className="text-slate-600">사용자 권한 설정 및 관리</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 font-medium">
                <span>관리하기</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        <div className="quote-sheet">
          <div className="relative">
            <div className="absolute inset-4 border border-dashed border-green-200 rounded-lg opacity-30"></div>
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">실시간 통계</h2>
                <button
                  onClick={fetchStats}
                  className={`p-2 text-slate-600 hover:text-slate-800 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                  disabled={refreshing}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              {stats && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">전체 사용자</span>
                    <span className="font-semibold text-slate-800">{stats.totalUsers || 0}명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">오늘 Claude 사용</span>
                    <span className="font-semibold text-slate-800">{stats.summary?.claudeChats || 0}회</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">오늘 작성된 글</span>
                    <span className="font-semibold text-slate-800">{stats.summary?.postsWritten || 0}개</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Summary */}
      {stats && stats.summary && (
        <div className="quote-sheet">
          <div className="relative">
            <div className="absolute inset-4 border border-dashed border-purple-200 rounded-lg opacity-30"></div>
            <div className="relative z-10 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                최근 7일 활동 요약
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{stats.summary.claudeChats}</p>
                  <p className="text-sm text-slate-600">Claude 대화</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{stats.summary.postsWritten}</p>
                  <p className="text-sm text-slate-600">글 작성</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Edit className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{stats.summary.postsEdited}</p>
                  <p className="text-sm text-slate-600">글 수정</p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{stats.summary.postsDeleted}</p>
                  <p className="text-sm text-slate-600">글 삭제</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Usage Chart (placeholder) */}
      {stats && stats.dailyUsage && stats.dailyUsage.length > 0 && (
        <div className="quote-sheet">
          <div className="relative">
            <div className="absolute inset-4 border border-dashed border-indigo-200 rounded-lg opacity-30"></div>
            <div className="relative z-10 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                일별 사용량 추이
              </h3>
              
              <div className="space-y-2">
                {stats.dailyUsage.slice(0, 7).map((day, index) => {
                  const date = new Date(day.usage_date);
                  const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                  const maxCount = Math.max(...stats.dailyUsage.map(d => d.action_count));
                  const percentage = maxCount > 0 ? (day.action_count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 w-16">{dateStr}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700">
                          {day.action_count}회
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}