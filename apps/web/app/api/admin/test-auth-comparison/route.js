import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: 다양한 클라이언트 옵션으로 시도
  const clientConfigs = [
    {
      name: 'default_service',
      key: serviceRoleKey,
      options: {}
    },
    {
      name: 'with_auth_header',
      key: serviceRoleKey,
      options: {
        global: {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`
          }
        }
      }
    },
    {
      name: 'with_apikey_header',
      key: serviceRoleKey,
      options: {
        global: {
          headers: {
            apikey: serviceRoleKey
          }
        }
      }
    },
    {
      name: 'both_headers',
      key: serviceRoleKey,
      options: {
        global: {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey
          }
        }
      }
    },
    {
      name: 'anon_with_service_auth',
      key: anonKey,
      options: {
        global: {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`
          }
        }
      }
    }
  ];

  for (const config of clientConfigs) {
    try {
      const client = createClient(supabaseUrl, config.key, config.options);
      
      const { data, error, count } = await client
        .from('research_posts')
        .select('id', { count: 'exact', head: true });
      
      results.tests.push({
        config: config.name,
        success: !error,
        count: count,
        error: error?.message || null,
        code: error?.code || null
      });
    } catch (e) {
      results.tests.push({
        config: config.name,
        success: false,
        error: e.message
      });
    }
  }

  // Test 2: Raw fetch로 직접 API 호출
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/research_posts?select=id&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    results.tests.push({
      config: 'raw_fetch_service',
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: data
    });
  } catch (e) {
    results.tests.push({
      config: 'raw_fetch_service',
      success: false,
      error: e.message
    });
  }

  // Test 3: Anon key로 raw fetch
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/research_posts?select=id&limit=1`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json'
      }
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    results.tests.push({
      config: 'raw_fetch_anon',
      success: response.ok,
      status: response.status,
      data: Array.isArray(data) ? data.length : data
    });
  } catch (e) {
    results.tests.push({
      config: 'raw_fetch_anon',
      success: false,
      error: e.message
    });
  }

  return NextResponse.json(results);
}