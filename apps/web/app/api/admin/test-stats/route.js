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

    // 2. Test posts table
    try {
      const { data, count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .limit(5);
      
      results.posts = { 
        count: count || data?.length || 0,
        sample: data?.map(p => ({ id: p.id, section: p.section, title: p.title })),
        error: error?.message || null 
      };
      console.log('[Test Stats API] Posts:', results.posts);
    } catch (e) {
      results.posts = { error: e.message };
    }

    // 3. Test claude_usage_logs table
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString();

    try {
      const { data, count, error } = await supabase
        .from('claude_usage_logs')
        .select('*', { count: 'exact' })
        .gte('created_at', todayString)
        .limit(5);
      
      results.claudeLogs = { 
        todayCount: count || data?.length || 0,
        sample: data?.slice(0, 2),
        error: error?.message || null 
      };
      console.log('[Test Stats API] Claude logs:', results.claudeLogs);
    } catch (e) {
      results.claudeLogs = { error: e.message };
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
        totalPosts: results.posts?.count || 0,
        todayClaudeLogs: results.claudeLogs?.todayCount || 0,
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