import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const results = {
    timestamp: new Date().toISOString(),
    keyInfo: {
      length: serviceRoleKey?.length,
      prefix: serviceRoleKey?.substring(0, 30) + '...',
      urlMatch: supabaseUrl?.includes('ukxchcyvxnbmsfrsamjk')
    },
    tests: []
  };

  // Test with service_role key but targeting a system table
  try {
    const client = createClient(supabaseUrl, serviceRoleKey);
    
    // Try to query user_permissions which worked before
    const { data, error } = await client
      .from('user_permissions')
      .select('email')
      .limit(1);
    
    results.tests.push({
      table: 'user_permissions',
      success: !error,
      error: error?.message || null,
      hasData: !!data && data.length > 0
    });
  } catch (e) {
    results.tests.push({
      table: 'user_permissions',
      success: false,
      error: e.message
    });
  }

  // Test database info query
  try {
    const client = createClient(supabaseUrl, serviceRoleKey);
    
    const { data, error } = await client.rpc('get_pg_version', {});
    
    results.tests.push({
      test: 'rpc_call',
      success: !error,
      error: error?.message || null,
      data: data
    });
  } catch (e) {
    results.tests.push({
      test: 'rpc_call', 
      success: false,
      error: e.message,
      note: 'RPC might not exist'
    });
  }

  return NextResponse.json(results);
}