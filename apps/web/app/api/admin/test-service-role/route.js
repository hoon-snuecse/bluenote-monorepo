import { NextResponse } from 'next/server';
// Removed next-auth import
import { checkAuth } from '@/lib/supabase-auth-helpers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { error: authError } = await checkAuth('admin');
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    // Service Role 클라이언트의 실제 동작 테스트
    const supabase = createAdminClient();
    
    const results = {
      timestamp: new Date().toISOString(),
      serviceRoleTest: {},
      errors: []
    };

    // 1. Service Role JWT 토큰 확인 (환경변수)
    results.serviceRoleTest.hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    results.serviceRoleTest.keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;
    
    // 2. 각 테이블에 대한 직접 쿼리 테스트
    const tables = ['research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts'];
    
    for (const table of tables) {
      try {
        // 단순 SELECT 1개만
        const { data, error } = await supabase
          .from(table)
          .select('id, title')
          .limit(1)
          .single();
        
        results.serviceRoleTest[table] = {
          success: !error,
          hasData: !!data,
          error: error?.message || null,
          errorCode: error?.code || null,
          errorHint: error?.hint || null,
          errorDetails: error?.details || null
        };
      } catch (e) {
        results.serviceRoleTest[table] = {
          success: false,
          error: e.message,
          type: 'exception'
        };
      }
    }

    // 3. RPC 함수 테스트 (있다면)
    try {
      const { data: rpcTest, error: rpcError } = await supabase
        .rpc('get_table_info', { table_name: 'research_posts' });
      
      results.serviceRoleTest.rpcFunction = {
        available: !rpcError,
        error: rpcError?.message || null
      };
    } catch (e) {
      results.serviceRoleTest.rpcFunction = {
        available: false,
        error: 'RPC function not found'
      };
    }

    // 4. 민감한 테이블 접근 테스트 (비교용)
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .limit(1);
      
      results.serviceRoleTest.sensitiveTableAccess = {
        success: !error,
        hasData: !!data,
        error: error?.message || null
      };
    } catch (e) {
      results.serviceRoleTest.sensitiveTableAccess = {
        success: false,
        error: e.message
      };
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      message: error.message 
    }, { status: 500 });
  }
}