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
    
    // Fetch all posts from different tables
    const [researchPosts, teachingPosts, analyticsPosts, shedPosts] = await Promise.all([
      supabase.from('research_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('teaching_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('analytics_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('shed_posts').select('*').order('created_at', { ascending: false })
    ]);
    
    const posts = {
      research: researchPosts.data || [],
      teaching: teachingPosts.data || [],
      analytics: analyticsPosts.data || [],
      shed: shedPosts.data || []
    };
    
    const stats = {
      research: posts.research.length,
      teaching: posts.teaching.length,
      analytics: posts.analytics.length,
      shed: posts.shed.length,
      total: posts.research.length + posts.teaching.length + posts.analytics.length + posts.shed.length
    };
    
    return Response.json({ 
      posts,
      stats
    });
    
  } catch (error) {
    console.error('[Admin Content API] Error:', error);
    return Response.json({ 
      error: 'Failed to fetch content',
      details: error.message 
    }, { status: 500 });
  }
}