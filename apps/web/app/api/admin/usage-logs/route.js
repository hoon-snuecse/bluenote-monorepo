import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found for usage-logs request');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
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