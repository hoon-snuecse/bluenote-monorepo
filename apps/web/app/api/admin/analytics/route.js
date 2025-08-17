import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create Supabase client with service role
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Fetch data for analytics
    const [users, researchPosts, teachingPosts, analyticsPosts, shedPosts] = await Promise.all([
      supabase.from('user_permissions').select('*'),
      supabase.from('research_posts').select('*'),
      supabase.from('teaching_posts').select('*'),
      supabase.from('analytics_posts').select('*'),
      supabase.from('shed_posts').select('*')
    ]);
    
    const allPosts = [
      ...(researchPosts.data || []).map(p => ({ ...p, section: 'research' })),
      ...(teachingPosts.data || []).map(p => ({ ...p, section: 'teaching' })),
      ...(analyticsPosts.data || []).map(p => ({ ...p, section: 'analytics' })),
      ...(shedPosts.data || []).map(p => ({ ...p, section: 'shed' }))
    ];
    
    const result = {
      totalUsers: users.data?.length || 0,
      totalPosts: allPosts.length,
      contentStats: {
        research: researchPosts.data?.length || 0,
        teaching: teachingPosts.data?.length || 0,
        analytics: analyticsPosts.data?.length || 0,
        shed: shedPosts.data?.length || 0
      },
      // Simple daily stats for the last 7 days
      dailyStats: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
          fullDate: date.toISOString().split('T')[0],
          claude: 0,
          posts: 0,
          logins: 0,
          uniqueLogins: 0
        };
      }),
      // Other fields with default values
      totalLogins: 0,
      todayLogins: 0,
      totalClaudeUsage: 0,
      todayClaudeUsage: 0,
      totalGradingSonnet: 0,
      todayGradingSonnet: 0,
      totalGradingOpus: 0,
      todayGradingOpus: 0,
      recentPosts: allPosts.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 10),
      userActivity: [],
      sonnetTopUsers: [],
      opusTopUsers: []
    };
    
    return Response.json(result);
    
  } catch (error) {
    console.error('[Admin Analytics API] Error:', error);
    return Response.json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }, { status: 500 });
  }
}