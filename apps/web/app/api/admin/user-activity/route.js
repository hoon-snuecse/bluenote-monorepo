import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // 현재 시간과 날짜 계산
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 모든 사용자 가져오기
    const { data: users, error: usersError } = await supabase
      .from('user_permissions')
      .select('email, role, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // 로그인 로그 가져오기
    const { data: loginLogs, error: logsError } = await supabase
      .from('usage_logs')
      .select('user_email, created_at, metadata')
      .eq('action_type', 'login')
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false });

    if (logsError) {
      console.error('Error fetching login logs:', logsError);
    }

    // grading 앱에서 채점 통계 가져오기
    let gradingStats = {};
    try {
      const gradingApiUrl = process.env.NODE_ENV === 'production'
        ? 'https://grading.bluenote.site/api/stats/user-evaluations'
        : 'http://localhost:3002/api/stats/user-evaluations';

      const gradingRes = await fetch(gradingApiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (gradingRes.ok) {
        const data = await gradingRes.json();
        gradingStats = data.userStats || {};
      }
    } catch (error) {
      console.error('Failed to fetch grading stats:', error);
    }

    // 사용자별 활동 통계 집계
    const userActivityMap = {};

    // 사용자 초기화
    users.forEach(user => {
      userActivityMap[user.email] = {
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
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
      };
    });

    // 로그인 통계 집계
    const allLoginLogs = loginLogs || [];
    
    // 전체 로그인 횟수를 위해 모든 로그인 로그 가져오기
    const { data: allTimeLogs } = await supabase
      .from('usage_logs')
      .select('user_email, created_at')
      .eq('action_type', 'login');

    // 전체 로그인 횟수 집계
    (allTimeLogs || []).forEach(log => {
      if (userActivityMap[log.user_email]) {
        userActivityMap[log.user_email].loginStats.total++;
      }
    });

    // 최근 로그인 및 주간 통계
    allLoginLogs.forEach(log => {
      if (userActivityMap[log.user_email]) {
        const logDate = new Date(log.created_at);
        
        // 주간 로그인
        userActivityMap[log.user_email].loginStats.week++;
        
        // 오늘 로그인
        if (logDate >= today) {
          userActivityMap[log.user_email].loginStats.today++;
        }
        
        // 최근 로그인 시간 업데이트
        if (!userActivityMap[log.user_email].loginStats.lastLogin || 
            logDate > new Date(userActivityMap[log.user_email].loginStats.lastLogin)) {
          userActivityMap[log.user_email].loginStats.lastLogin = log.created_at;
          
          // 메타데이터에서 디바이스/브라우저 정보 추출 (향후 구현)
          if (log.metadata) {
            // TODO: 메타데이터 구조에 따라 파싱
          }
        }
      }
    });

    // AI 채점 통계 병합
    Object.entries(gradingStats).forEach(([email, stats]) => {
      if (userActivityMap[email]) {
        userActivityMap[email].gradingStats = stats;
      }
    });

    // 배열로 변환하고 최근 로그인 순으로 정렬
    const userActivityList = Object.values(userActivityMap)
      .sort((a, b) => {
        if (!a.loginStats.lastLogin) return 1;
        if (!b.loginStats.lastLogin) return -1;
        return new Date(b.loginStats.lastLogin) - new Date(a.loginStats.lastLogin);
      });

    return NextResponse.json({
      users: userActivityList,
      summary: {
        totalUsers: users.length,
        activeToday: userActivityList.filter(u => u.loginStats.today > 0).length,
        activeThisWeek: userActivityList.filter(u => u.loginStats.week > 0).length
      }
    });
  } catch (error) {
    console.error('Error in user activity API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}