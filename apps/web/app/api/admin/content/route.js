import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  try {
    // Check authentication first
    const authClient = await createRouteHandlerClient();
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.error('[Admin Content API] Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check admin permissions
    const { data: permissions } = await authClient
      .from('user_permissions')
      .select('role')
      .eq('email', user.email)
      .single();
    
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
    const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Try to use service role client if available
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      );
    } else {
      supabase = authClient;
    }
    
    // Fetch all posts from different tables
    const [
      researchPosts,
      teachingPosts,
      analyticsPosts,
      shedPosts
    ] = await Promise.all([
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
    
    return NextResponse.json({ 
      posts,
      stats
    });
    
  } catch (error) {
    console.error('[Admin Content API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch content',
      details: error.message 
    }, { status: 500 });
  }
}