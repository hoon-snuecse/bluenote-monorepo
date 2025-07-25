import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Test 1: Direct query with service role key
  try {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    const { data, error, count } = await serviceClient
      .from('research_posts')
      .select('id, title', { count: 'exact' });
    
    results.tests.push({
      test: 'service_role_direct_select',
      success: !error,
      dataLength: data?.length || 0,
      count: count,
      error: error,
      firstItem: data?.[0] || null
    });
  } catch (e) {
    results.tests.push({
      test: 'service_role_direct_select',
      success: false,
      error: e.message
    });
  }

  // Test 2: Count with service role
  try {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    const { count, error } = await serviceClient
      .from('research_posts')
      .select('*', { count: 'exact', head: true });
    
    results.tests.push({
      test: 'service_role_count_only',
      success: !error,
      count: count,
      error: error
    });
  } catch (e) {
    results.tests.push({
      test: 'service_role_count_only',
      success: false,
      error: e.message
    });
  }

  // Test 3: Direct query with anon key
  try {
    const anonClient = createClient(supabaseUrl, anonKey);
    
    const { data, error, count } = await anonClient
      .from('research_posts')
      .select('id, title', { count: 'exact' });
    
    results.tests.push({
      test: 'anon_key_direct_select',
      success: !error,
      dataLength: data?.length || 0,
      count: count,
      error: error
    });
  } catch (e) {
    results.tests.push({
      test: 'anon_key_direct_select',
      success: false,
      error: e.message
    });
  }

  // Test 4: RPC call test
  try {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    // Try a simple RPC if exists, or just test auth
    const { data: authTest, error: authError } = await serviceClient.auth.getUser();
    
    results.tests.push({
      test: 'service_auth_test',
      success: !authError,
      error: authError,
      note: 'Service role should not have a user'
    });
  } catch (e) {
    results.tests.push({
      test: 'service_auth_test',
      success: false,
      error: e.message
    });
  }

  // Test 5: Manual count for each table
  try {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const tables = ['research_posts', 'teaching_posts', 'analytics_posts', 'shed_posts'];
    const counts = {};
    
    for (const table of tables) {
      const { data, error } = await serviceClient
        .from(table)
        .select('id');
      
      counts[table] = {
        count: data?.length || 0,
        error: error?.message || null
      };
    }
    
    results.tests.push({
      test: 'manual_counts_all_tables',
      success: true,
      counts: counts
    });
  } catch (e) {
    results.tests.push({
      test: 'manual_counts_all_tables',
      success: false,
      error: e.message
    });
  }

  return NextResponse.json(results);
}