import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  try {
    // Check authentication first
    const authClient = await createRouteHandlerClient();
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.error('[Admin Stats API] Auth error:', userError);
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
    let usingServiceRole = false;
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Using service role key for admin stats');
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
      usingServiceRole = true;
    } else {
      console.warn('Service role key not available, using auth client');
      supabase = authClient;
    }
    
    const koreaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const todayStart = new Date(koreaTime.setHours(0, 0, 0, 0)).toISOString();
    
    // Fetch data using correct table names
    const [
      usersResult,
      researchResult,
      teachingResult,
      analyticsResult,
      shedResult,
      logsResult,
      gradingResult
    ] = await Promise.all([
      supabase.from('user_permissions').select('*'),
      supabase.from('research_posts').select('*'),
      supabase.from('teaching_posts').select('*'),
      supabase.from('analytics_posts').select('*'),
      supabase.from('shed_posts').select('*'),
      supabase.from('usage_logs')
        .select('*')
        .gte('created_at', todayStart),
      supabase.from('grading_logs')
        .select('*')
        .gte('created_at', todayStart)
    ]);
    
    // Enhanced debugging for Vercel deployment
    console.log('Environment check:', {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL || 'not-vercel',
      usingServiceRole
    });
    
    // Calculate total posts
    const totalPosts = (researchResult.data?.length || 0) + 
                      (teachingResult.data?.length || 0) + 
                      (analyticsResult.data?.length || 0) + 
                      (shedResult.data?.length || 0);
    
    // Log query results with more detail
    console.log('Query results:', {
      users: { 
        count: usersResult.data?.length || 0, 
        error: usersResult.error?.message || null
      },
      posts: { 
        research: researchResult.data?.length || 0,
        teaching: teachingResult.data?.length || 0,
        analytics: analyticsResult.data?.length || 0,
        shed: shedResult.data?.length || 0,
        total: totalPosts,
        errors: {
          research: researchResult.error?.message || null,
          teaching: teachingResult.error?.message || null,
          analytics: analyticsResult.error?.message || null,
          shed: shedResult.error?.message || null
        }
      },
      usageLogs: { 
        count: logsResult.data?.length || 0, 
        error: logsResult.error?.message || null
      },
      gradingLogs: { 
        count: gradingResult.data?.length || 0, 
        error: gradingResult.error?.message || null
      }
    });
    
    // Count posts by section
    const postsBySection = {
      research: researchResult.data?.length || 0,
      teaching: teachingResult.data?.length || 0,
      analytics: analyticsResult.data?.length || 0,
      shed: shedResult.data?.length || 0
    };
    
    // Count grading by model
    let sonnetCount = 0;
    let haikuCount = 0;
    
    gradingResult.data?.forEach(log => {
      if (log.model === 'sonnet') sonnetCount++;
      else if (log.model === 'haiku') haikuCount++;
    });
    
    return NextResponse.json({
      totalUsers: usersResult.data?.length || 0,
      totalPosts: totalPosts,
      todayLogs: logsResult.data?.length || 0,
      todayGradingSonnet: sonnetCount,
      todayGradingHaiku: haikuCount,
      users: usersResult.data || [],
      postsBySection,
      debug: {
        usingServiceRole,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        errors: {
          users: usersResult.error?.message || null,
          research: researchResult.error?.message || null,
          teaching: teachingResult.error?.message || null,
          analytics: analyticsResult.error?.message || null,
          shed: shedResult.error?.message || null,
          logs: logsResult.error?.message || null,
          grading: gradingResult.error?.message || null
        }
      }
    });
  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    }, { status: 500 });
  }
}