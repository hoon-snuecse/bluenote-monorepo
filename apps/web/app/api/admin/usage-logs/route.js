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
    
    if (!session.user.isAdmin) {
      console.log('User not admin:', session.user.email, 'isAdmin:', session.user.isAdmin, 'role:', session.user.role);
      return NextResponse.json({ error: 'Unauthorized - Not admin' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    const { data: logs, error } = await supabase
      .from('usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000); // Get last 1000 logs
    
    if (error) {
      console.error('Error fetching usage logs:', error);
      return NextResponse.json({ error: 'Failed to fetch usage logs' }, { status: 500 });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error('Error in usage logs API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}