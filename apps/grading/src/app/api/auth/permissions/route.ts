import { NextResponse } from 'next/server';
import { createServerClient } from '@bluenote/supabase-auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user permissions using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_email', session.user.email)
      .single();
    
    if (error) {
      // If no permissions found, return default permissions
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          user_email: session.user.email,
          role: 'user',
          can_write: false,
          claude_daily_limit: 3
        });
      }
      
      console.error('Error fetching permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}