import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 환경 변수 확인
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const tests = {
      serviceKeyExists: !!serviceKey,
      serviceKeyLength: serviceKey?.length || 0,
      anonKeyExists: !!anonKey,
      timestamp: new Date().toISOString()
    };

    // Service Role 테스트
    try {
      const adminSupabase = createAdminClient();
      const { data: adminData, error: adminError, count } = await adminSupabase
        .from('user_permissions')
        .select('*', { count: 'exact' });
      
      tests.serviceRole = {
        success: !adminError,
        error: adminError?.message || null,
        dataLength: adminData?.length || 0,
        count: count || 0,
        sampleData: adminData?.slice(0, 2).map(u => ({ email: u.email, role: u.role }))
      };
    } catch (e) {
      tests.serviceRole = { error: e.message };
    }

    // Anon Key 테스트 (비교용)
    try {
      const anonSupabase = await createClient();
      const { data: anonData, error: anonError } = await anonSupabase
        .from('user_permissions')
        .select('*')
        .limit(1);
      
      tests.anonKey = {
        success: !anonError,
        error: anonError?.message || null,
        dataLength: anonData?.length || 0
      };
    } catch (e) {
      tests.anonKey = { error: e.message };
    }

    // RLS 정책 확인 쿼리
    try {
      const adminSupabase = createAdminClient();
      const { data: policies } = await adminSupabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'user_permissions');
      
      tests.rlsPolicies = {
        count: policies?.length || 0,
        policies: policies?.map(p => ({ name: p.policyname, cmd: p.cmd }))
      };
    } catch (e) {
      // pg_policies는 시스템 테이블이라 접근 못할 수 있음
      tests.rlsPolicies = { note: 'Cannot access system tables' };
    }

    return NextResponse.json({ tests });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test API Error', 
      message: error.message 
    }, { status: 500 });
  }
}