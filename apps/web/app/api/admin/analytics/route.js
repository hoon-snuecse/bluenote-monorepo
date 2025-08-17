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
      // Daily stats for the last 7 days with actual post counts
      dailyStats: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        // Count posts created on this date
        const postsOnDate = allPosts.filter(post => 
          post.created_at && post.created_at.startsWith(dateStr)
        ).length;
        
        return {
          date: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
          fullDate: dateStr,
          claude: Math.floor(Math.random() * 5), // Mock data for demo
          posts: postsOnDate,
          logins: Math.floor(Math.random() * 10), // Mock data for demo
          uniqueLogins: Math.floor(Math.random() * 5) // Mock data for demo
        };
      }),
      // Stats with sample data
      totalLogins: 42,
      todayLogins: 5,
      totalClaudeUsage: 28,
      todayClaudeUsage: 3,
      totalGradingSonnet: 15,
      todayGradingSonnet: 2,
      totalGradingOpus: 8,
      todayGradingOpus: 1,
      recentPosts: allPosts.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 10),
      // Sample user activity data
      userActivity: users.data?.slice(0, 5).map(user => ({
        email: user.user_email || user.email,
        role: user.role || 'user',
        loginStats: {
          today: Math.floor(Math.random() * 3),
          week: Math.floor(Math.random() * 20),
          total: Math.floor(Math.random() * 100),
          lastLogin: new Date().toISOString()
        },
        gradingStats: {
          sonnet: Math.floor(Math.random() * 10),
          opus: Math.floor(Math.random() * 5)
        },
        deviceInfo: {
          device: 'Desktop',
          browser: 'Chrome'
        }
      })) || [],
      // Sample top users data
      sonnetTopUsers: [
        { name: 'hoon', count: 12 },
        { name: 'user1', count: 8 },
        { name: 'user2', count: 5 }
      ],
      opusTopUsers: [
        { name: 'hoon', count: 6 },
        { name: 'user3', count: 4 },
        { name: 'user4', count: 2 }
      ]
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