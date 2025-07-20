import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Check session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'No session',
        session: null 
      });
    }

    // Check database for tokens using admin client
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_email', session.user.email);

    // Also check if table exists
    const { data: tableData, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'google_tokens')
      .single();

    return NextResponse.json({
      session: {
        email: session.user.email,
        name: session.user.name,
        isAdmin: session.user.isAdmin
      },
      tokens: {
        tableExists: !!tableData,
        tableError: tableError?.message,
        found: !!data && data.length > 0,
        count: data?.length || 0,
        error: error?.message,
        data: data?.map(t => ({
          user_email: t.user_email,
          created_at: t.created_at,
          expires_at: t.expires_at,
          scope: t.scope,
          access_token: t.access_token ? '***' + t.access_token.slice(-10) : null,
          refresh_token: t.refresh_token ? '***' + t.refresh_token.slice(-10) : null
        }))
      },
      environment: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}