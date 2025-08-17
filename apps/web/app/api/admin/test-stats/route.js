import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log('[Test Stats API] Starting...');
  
  try {
    // Skip auth check for testing
    // Just create a client and test queries
    
    // Log environment
    console.log('[Test Stats API] Environment:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    
    let supabase;
    let clientType = 'unknown';
    
    // Try service role first
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('[Test Stats API] Using service role key');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      clientType = 'service-role';
    } else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('[Test Stats API] Using anon key');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      clientType = 'anon';
    } else {
      return NextResponse.json({ 
        error: 'Missing Supabase credentials',
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 500 });
    }
    const results = {};
    
    console.log('[Test Stats API] Testing with', clientType, 'client');

    // 1. Test user_permissions table
    try {
      const { data, count, error } = await supabase
        .from('user_permissions')
        .select('*', { count: 'exact' })
        .limit(5);
      
      results.users = { 
        count: count || data?.length || 0, 
        sample: data?.map(u => ({ email: u.email, role: u.role })),
        error: error?.message || null 
      };
      console.log('[Test Stats API] Users:', results.users);
    } catch (e) {
      results.users = { error: e.message };
    }

    // 2. Test posts tables (separated by section)
    const postsTables = ['research_posts', 'teaching_posts', 'analytics_posts', 'shed_posts'];
    let totalPosts = 0;
    results.posts = {};
    
    for (const table of postsTables) {
      try {
        const { data, count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(2);
        
        const tableCount = count || data?.length || 0;
        totalPosts += tableCount;
        
        results.posts[table] = { 
          count: tableCount,
          sample: data?.slice(0, 1).map(p => ({ id: p.id, title: p.title })),
          error: error?.message || null 
        };
        console.log(`[Test Stats API] ${table}:`, results.posts[table]);
      } catch (e) {
        results.posts[table] = { error: e.message };
      }
    }
    results.posts.total = totalPosts;

    // 3. Test usage_logs table (not claude_usage_logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString();

    try {
      const { data, count, error } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact' })
        .gte('created_at', todayString)
        .limit(5);
      
      results.usageLogs = { 
        todayCount: count || data?.length || 0,
        sample: data?.slice(0, 2),
        error: error?.message || null 
      };
      console.log('[Test Stats API] Usage logs:', results.usageLogs);
    } catch (e) {
      results.usageLogs = { error: e.message };
    }
    
    // 4. Test grading_logs table
    try {
      const { data, count, error } = await supabase
        .from('grading_logs')
        .select('*', { count: 'exact' })
        .gte('created_at', todayString)
        .limit(5);
      
      results.gradingLogs = { 
        todayCount: count || data?.length || 0,
        sample: data?.slice(0, 2),
        error: error?.message || null 
      };
      console.log('[Test Stats API] Grading logs:', results.gradingLogs);
    } catch (e) {
      results.gradingLogs = { error: e.message };
    }

    return NextResponse.json({
      success: true,
      clientType,
      timestamp: new Date().toISOString(),
      today: todayString,
      results,
      summary: {
        totalUsers: results.users?.count || 0,
        totalPosts: results.posts?.total || 0,
        todayUsageLogs: results.usageLogs?.todayCount || 0,
        todayGradingLogs: results.gradingLogs?.todayCount || 0
      }
    });

  } catch (error) {
    console.error('[Test Stats API] Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Test API Error', 
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}