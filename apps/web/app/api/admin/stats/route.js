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

    // Get usage statistics
    const usageStats = await getUsageStats(7); // Last 7 days
    
    // Get post counts
    const supabase = createAdminClient();
    const [
      researchResult,
      teachingResult,
      analyticsResult,
      shedResult,
      todayLogsResult
    ] = await Promise.all([
      supabase.from('research_posts').select('id', { count: 'exact', head: true }),
      supabase.from('teaching_posts').select('id', { count: 'exact', head: true }),
      supabase.from('analytics_posts').select('id', { count: 'exact', head: true }),
      supabase.from('shed_posts').select('id', { count: 'exact', head: true }),
      // Get today's usage logs count
      supabase
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0])
    ]);
    
    const totalPosts = (researchResult.count || 0) + 
                      (teachingResult.count || 0) + 
                      (analyticsResult.count || 0) + 
                      (shedResult.count || 0);
    
    return NextResponse.json({
      ...usageStats,
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