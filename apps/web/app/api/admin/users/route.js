import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@bluenote/supabase-auth/route-handler-client';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  console.log('[Admin Users API] GET request received');
  
  try {
    // Check authentication first
    const authClient = await createRouteHandlerClient();
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.error('[Admin Users API] Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('[Admin Users API] User authenticated:', user.email);
    
    // Check admin permissions
    const { data: permissions } = await authClient
      .from('user_permissions')
      .select('role')
      .eq('email', user.email)
      .single();
    
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
    const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
    
    console.log('[Admin Users API] Is admin:', isAdmin);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Try to use service role client if available
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('[Admin Users API] Using service role client');
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
      console.log('[Admin Users API] Using auth client');
      supabase = authClient;
    }
    
    // Fetch all users
    const { data: users, error } = await supabase
      .from('user_permissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('[Admin Users API] Users fetched:', users?.length || 0);
    
    if (error) {
      console.error('[Admin Users API] Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      users: users || [],
      count: users?.length || 0 
    });
    
  } catch (error) {
    console.error('[Admin Users API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error.message 
    }, { status: 500 });
  }
}