import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // 최근 로그인 로그 확인
    const { data: loginLogs, error: loginError } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('action_type', 'login')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // 모든 action_type 확인
    const { data: allTypes, error: typesError } = await supabase
      .from('usage_logs')
      .select('action_type')
      .limit(100);
    
    const uniqueTypes = [...new Set(allTypes?.map(log => log.action_type) || [])];

    return NextResponse.json({ 
      loginLogs: loginLogs || [],
      loginCount: loginLogs?.length || 0,
      allActionTypes: uniqueTypes,
      errors: {
        login: loginError?.message,
        types: typesError?.message
      }
    });
  } catch (error) {
    console.error('Error in check logs API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}