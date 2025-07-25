import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {}
  };

  // 1. 환경변수 체크
  results.checks.envVars = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
    serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
  };

  // 2. Admin Client 생성 테스트
  try {
    const adminClient = createAdminClient();
    results.checks.adminClient = { success: true };
    
    // 3. 각 테이블 쿼리 테스트
    const tables = ['research_posts', 'teaching_posts', 'analytics_posts', 'shed_posts', 'usage_logs', 'user_permissions'];
    
    for (const table of tables) {
      try {
        const { data, error, count } = await adminClient
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        results.checks[table] = {
          success: !error,
          count: count || 0,
          error: error?.message || null,
          status: error?.status || null,
          code: error?.code || null
        };
        
        // count가 null인 경우 대체 방법 시도
        if (count === null && !error) {
          const { data: countData, error: countError } = await adminClient
            .from(table)
            .select('id');
          
          results.checks[table].alternativeCount = countData ? countData.length : 0;
          results.checks[table].alternativeError = countError?.message || null;
        }
      } catch (e) {
        results.checks[table] = {
          success: false,
          error: e.message
        };
      }
    }
    
    // 4. 간단한 테스트 쿼리
    try {
      const { data, error } = await adminClient
        .from('user_permissions')
        .select('email')
        .limit(1);
      
      results.checks.testQuery = {
        success: !error,
        hasData: !!data && data.length > 0,
        error: error?.message || null
      };
    } catch (e) {
      results.checks.testQuery = {
        success: false,
        error: e.message
      };
    }
    
  } catch (error) {
    results.checks.adminClient = { 
      success: false, 
      error: error.message 
    };
  }

  // 5. Regular Client 테스트 (비교용)
  try {
    const regularClient = await createClient();
    const { count, error } = await regularClient
      .from('research_posts')
      .select('*', { count: 'exact', head: true });
    
    results.checks.regularClient = {
      success: !error,
      count: count || 0,
      error: error?.message || null
    };
  } catch (error) {
    results.checks.regularClient = {
      success: false,
      error: error.message
    };
  }

  return NextResponse.json(results);
}