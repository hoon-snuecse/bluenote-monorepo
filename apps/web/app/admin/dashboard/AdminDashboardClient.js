'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, FileText, Settings, BarChart3, ArrowLeft } from 'lucide-react';

export default function AdminDashboardClient() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    todayLogs: 0
  });

  useEffect(() => {
    fetch('/api/auth/session-check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.session?.user?.isAdmin) {
          setSession(data.session);
          fetchStats();
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users count
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      
      // Fetch posts from all sections
      const sections = ['research', 'teaching', 'analytics', 'shed'];
      const postsPromises = sections.map(section => 
        fetch(`/api/${section}`).then(res => res.json())
      );
      const postsResults = await Promise.all(postsPromises);
      
      // Count total posts
      const totalPosts = postsResults.reduce((sum, result) => 
        sum + (result.posts?.length || 0), 0
      );
      
      // Fetch usage logs
      const logsRes = await fetch('/api/admin/usage-logs');
      const logsData = await logsRes.json();
      
      // Count today's logs
      const today = new Date().toDateString();
      const todayLogs = logsData.logs?.filter(log => 
        new Date(log.created_at).toDateString() === today
      ).length || 0;
      
      setStats({
        totalUsers: usersData.users?.length || 0,
        totalPosts,
        todayLogs
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한 없음</h1>
          <p className="text-gray-600 mb-4">관리자만 이 페이지에 접근할 수 있습니다.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const adminFeatures = [
    {
      title: '사용자 관리',
      description: '등록된 사용자 목록 및 권한 관리',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: '콘텐츠 관리',
      description: '블로그 포스트 및 페이지 관리',
      icon: FileText,
      href: '/admin/content',
      color: 'bg-green-500'
    },
    {
      title: '통계 및 분석',
      description: '사이트 사용 통계 및 분석 데이터',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500'
    },
    {
      title: '시스템 설정',
      description: '사이트 설정 및 환경 구성',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">관리자 대시보드</h1>
                <p className="text-slate-400 text-sm">BlueNote Atelier 시스템 관리</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white mb-2">환영합니다, {session.user.name}님</h2>
          <p className="text-slate-400">BlueNote Atelier 관리자 대시보드입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-all p-6"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">빠른 상태</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-400">총 사용자</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-400">총 포스트</p>
              <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-400">오늘 활동</p>
              <p className="text-2xl font-bold text-white">{stats.todayLogs}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}