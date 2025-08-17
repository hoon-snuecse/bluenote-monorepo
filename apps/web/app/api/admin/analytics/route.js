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
    
    // Fetch data for analytics - including usage_logs and grading evaluations
    const [users, researchPosts, teachingPosts, analyticsPosts, shedPosts, usageLogs, evaluations] = await Promise.all([
      supabase.from('user_permissions').select('*'),
      supabase.from('research_posts').select('*'),
      supabase.from('teaching_posts').select('*'),
      supabase.from('analytics_posts').select('*'),
      supabase.from('shed_posts').select('*'),
      supabase.from('usage_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('Evaluation').select('*').order('evaluatedAt', { ascending: false })
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
      // Daily stats for the last 7 days with actual data
      dailyStats: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        // Count posts created on this date
        const postsOnDate = allPosts.filter(post => 
          post.created_at && post.created_at.startsWith(dateStr)
        ).length;
        
        // Count logins on this date from usage_logs
        const loginsOnDate = (usageLogs.data || []).filter(log =>
          log.created_at && log.created_at.startsWith(dateStr)
        );
        
        const uniqueUsersOnDate = new Set(loginsOnDate.map(log => log.user_email)).size;
        
        return {
          date: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
          fullDate: dateStr,
          claude: 0, // Claude usage tracking not implemented yet
          posts: postsOnDate,
          logins: loginsOnDate.length,
          uniqueLogins: uniqueUsersOnDate
        };
      }),
      // Stats with real login data from usage_logs
      totalLogins: usageLogs.data?.length || 0,
      todayLogins: (usageLogs.data || []).filter(log => 
        log.created_at && log.created_at.startsWith(new Date().toISOString().split('T')[0])
      ).length,
      totalClaudeUsage: 0, // Claude usage tracking not implemented yet
      todayClaudeUsage: 0,
      // Real grading statistics from Evaluation table
      totalGradingSonnet: (evaluations.data || []).filter(e => 
        e.evaluatedBy && e.evaluatedBy.includes('sonnet')
      ).length,
      todayGradingSonnet: (evaluations.data || []).filter(e => 
        e.evaluatedBy && e.evaluatedBy.includes('sonnet') && 
        e.evaluatedAt && e.evaluatedAt.startsWith(new Date().toISOString().split('T')[0])
      ).length,
      totalGradingOpus: (evaluations.data || []).filter(e => 
        e.evaluatedBy && e.evaluatedBy.includes('opus')
      ).length,
      todayGradingOpus: (evaluations.data || []).filter(e => 
        e.evaluatedBy && e.evaluatedBy.includes('opus') && 
        e.evaluatedAt && e.evaluatedAt.startsWith(new Date().toISOString().split('T')[0])
      ).length,
      recentPosts: allPosts.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 10),
      // Real user activity data from usage_logs
      userActivity: users.data?.slice(0, 10).map(user => {
        const userEmail = user.user_email || user.email;
        const userLogs = (usageLogs.data || []).filter(log => log.user_email === userEmail);
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const todayLogs = userLogs.filter(log => log.created_at && log.created_at.startsWith(today));
        const weekLogs = userLogs.filter(log => log.created_at && log.created_at >= weekAgo);
        const lastLog = userLogs[0]; // Already sorted by created_at desc
        
        return {
          email: userEmail,
          role: user.role || 'user',
          loginStats: {
            today: todayLogs.length,
            week: weekLogs.length,
            total: userLogs.length,
            lastLogin: lastLog?.created_at || null
          },
          gradingStats: {
            sonnet: 0, // Grading logs not implemented yet
            opus: 0
          },
          deviceInfo: {
            device: 'Unknown',
            browser: 'Unknown'
          }
        };
      }) || [],
      // Real grading statistics from Evaluation table
      sonnetTopUsers: (() => {
        const userCounts = {};
        (evaluations.data || []).filter(e => 
          e.evaluatedBy && e.evaluatedBy.includes('sonnet') && e.evaluatedByUser
        ).forEach(evaluation => {
          const email = evaluation.evaluatedByUser;
          userCounts[email] = (userCounts[email] || 0) + 1;
        });
        return Object.entries(userCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([email, count]) => ({
            name: email.split('@')[0],
            email: email,
            count: count
          }));
      })(),
      opusTopUsers: (() => {
        const userCounts = {};
        (evaluations.data || []).filter(e => 
          e.evaluatedBy && e.evaluatedBy.includes('opus') && e.evaluatedByUser
        ).forEach(evaluation => {
          const email = evaluation.evaluatedByUser;
          userCounts[email] = (userCounts[email] || 0) + 1;
        });
        return Object.entries(userCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([email, count]) => ({
            name: email.split('@')[0],
            email: email,
            count: count
          }));
      })(),
      // Login statistics from usage_logs
      loginTopUsers: (() => {
        const userCounts = {};
        (usageLogs.data || []).filter(log => log.action_type === 'login').forEach(log => {
          const email = log.user_email;
          if (email) {
            userCounts[email] = (userCounts[email] || 0) + 1;
          }
        });
        return Object.entries(userCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([email, count]) => ({
            name: email.split('@')[0], // Use username part of email
            email: email,
            count: count
          }));
      })()
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