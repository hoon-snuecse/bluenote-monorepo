import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const results = {};

    // 1. 콘텐츠 통계 테스트
    try {
      const { count: researchCount, error: researchError } = await supabase
        .from('research_posts')
        .select('*', { count: 'exact', head: true });
      
      results.research = { count: researchCount, error: researchError };
    } catch (e) {
      results.research = { error: e.message };
    }

    try {
      const { count: teachingCount, error: teachingError } = await supabase
        .from('teaching_posts')
        .select('*', { count: 'exact', head: true });
      
      results.teaching = { count: teachingCount, error: teachingError };
    } catch (e) {
      results.teaching = { error: e.message };
    }

    try {
      const { count: analyticsCount, error: analyticsError } = await supabase
        .from('analytics_posts')
        .select('*', { count: 'exact', head: true });
      
      results.analytics = { count: analyticsCount, error: analyticsError };
    } catch (e) {
      results.analytics = { error: e.message };
    }

    try {
      const { count: shedCount, error: shedError } = await supabase
        .from('shed_posts')
        .select('*', { count: 'exact', head: true });
      
      results.shed = { count: shedCount, error: shedError };
    } catch (e) {
      results.shed = { error: e.message };
    }

    // 2. 최근 게시물 테스트
    try {
      const { data: recentPosts, error: postsError } = await supabase
        .from('research_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      
      results.recentPosts = { data: recentPosts, error: postsError };
    } catch (e) {
      results.recentPosts = { error: e.message };
    }

    // 3. 로그 통계 테스트
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString();

    try {
      const { data: todayLogs, error: todayError } = await supabase
        .from('usage_logs')
        .select('action_type, created_at')
        .gte('created_at', todayString);
      
      results.todayLogs = { 
        total: todayLogs?.length || 0,
        byType: todayLogs ? todayLogs.reduce((acc, log) => {
          acc[log.action_type] = (acc[log.action_type] || 0) + 1;
          return acc;
        }, {}) : {},
        error: todayError 
      };
    } catch (e) {
      results.todayLogs = { error: e.message };
    }

    // 4. Grading API 테스트
    try {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://grading.bluenote.site'
        : 'http://localhost:3002';

      const response = await fetch(`${baseUrl}/api/stats/evaluations`);
      results.gradingApi = {
        status: response.status,
        ok: response.ok,
        url: `${baseUrl}/api/stats/evaluations`
      };

      if (response.ok) {
        const data = await response.json();
        results.gradingApi.data = data;
      }
    } catch (e) {
      results.gradingApi = { error: e.message };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      today: todayString,
      results
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test API Error', 
      message: error.message 
    }, { status: 500 });
  }
}