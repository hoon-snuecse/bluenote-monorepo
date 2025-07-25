import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsageStats } from '@/lib/usage';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get usage statistics (실패해도 계속 진행)
    let usageStats = {};
    try {
      usageStats = await getUsageStats(7); // Last 7 days
    } catch (error) {
      console.error('Error getting usage stats:', error);
      // Continue without usage stats
    }
    
    // Get post counts
    let supabase;
    try {
      supabase = createAdminClient();
      console.log('Admin client created successfully');
    } catch (error) {
      console.error('Failed to create admin client:', error);
      // Fallback to regular client
      const { createClient } = await import('@/lib/supabase/server');
      supabase = await createClient();
      console.log('Using fallback client');
    }
    
    const [
      researchResult,
      teachingResult,
      analyticsResult,
      shedResult,
      todayLogsResult
    ] = await Promise.all([
      supabase.from('research_posts').select('*', { count: 'exact', head: true }),
      supabase.from('teaching_posts').select('*', { count: 'exact', head: true }),
      supabase.from('analytics_posts').select('*', { count: 'exact', head: true }),
      supabase.from('shed_posts').select('*', { count: 'exact', head: true }),
      // Get today's usage logs count
      supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0])
    ]);
    
    console.log('Environment check:', {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    });
    
    console.log('Post counts:', {
      research: { count: researchResult.count, error: researchResult.error },
      teaching: { count: teachingResult.count, error: teachingResult.error },
      analytics: { count: analyticsResult.count, error: analyticsResult.error },
      shed: { count: shedResult.count, error: shedResult.error },
      todayLogs: { count: todayLogsResult.count, error: todayLogsResult.error }
    });
    
    const totalPosts = (researchResult.count || 0) + 
                      (teachingResult.count || 0) + 
                      (analyticsResult.count || 0) + 
                      (shedResult.count || 0);
    
    // Remove error field if exists
    const { error, ...cleanUsageStats } = usageStats;
    
    return NextResponse.json({
      ...cleanUsageStats,
      totalPosts,
      todayUsage: todayLogsResult.count || 0,
      postsBreakdown: {
        research: researchResult.count || 0,
        teaching: teachingResult.count || 0,
        analytics: analyticsResult.count || 0,
        shed: shedResult.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    }, { status: 500 });
  }
}