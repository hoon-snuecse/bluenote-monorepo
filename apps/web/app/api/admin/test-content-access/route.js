import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const tests = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    // 각 테이블 테스트
    const tables = ['research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts', 'usage_logs'];
    
    for (const table of tables) {
      try {
        // 1. 카운트 시도
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        // 2. 실제 데이터 가져오기 시도
        const { data, error: dataError } = await supabase
          .from(table)
          .select('*')
          .limit(2);
        
        // 3. RLS 상태 확인 (pg_tables는 시스템 테이블)
        let rlsEnabled = null;
        try {
          const { data: tableInfo } = await supabase
            .rpc('get_table_info', { table_name: table })
            .single();
          rlsEnabled = tableInfo?.rls_enabled;
        } catch (e) {
          // RPC 함수가 없을 수 있음
        }
        
        tests.tables[table] = {
          count: count || 0,
          countError: countError?.message || null,
          dataLength: data?.length || 0,
          dataError: dataError?.message || null,
          rlsEnabled: rlsEnabled,
          sampleData: data?.slice(0, 1).map(d => ({
            id: d.id,
            title: d.title || d.action_type || 'N/A',
            created_at: d.created_at
          }))
        };
      } catch (e) {
        tests.tables[table] = { error: e.message };
      }
    }

    // Service Role 권한 테스트
    try {
      const { data: policies } = await supabase
        .from('pg_policies')
        .select('tablename, policyname')
        .in('tablename', tables);
      
      tests.policiesFound = policies?.length || 0;
    } catch (e) {
      tests.policiesNote = 'Cannot query pg_policies';
    }

    return NextResponse.json({ tests });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test API Error', 
      message: error.message 
    }, { status: 500 });
  }
}