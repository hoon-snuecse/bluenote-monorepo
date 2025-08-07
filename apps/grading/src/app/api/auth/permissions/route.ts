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
    // Try user_email first, then email column for backward compatibility
    let { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_email', session.user.email)
      .single();
    
    // If user_email column doesn't exist, try email column
    if (error && error.code === '42703') {
      const result = await supabase
        .from('user_permissions')
        .select('*')
        .eq('email', session.user.email)
        .single();
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.warn('Permissions lookup error:', error);
      
      // Return default permissions for any error
      // This includes: table doesn't exist, no row found, etc.
      const defaultPermissions = {
        user_email: session.user.email,
        role: 'user',
        can_write: false,
        can_grade: false,
        claude_daily_limit: 3
      };
      
      // Check if user is admin by email
      if (session.user.email === 'hoon@snuecse.org') {
        defaultPermissions.role = 'admin';
        defaultPermissions.can_write = true;
        defaultPermissions.can_grade = true;
        defaultPermissions.claude_daily_limit = 100;
      }
      
      return NextResponse.json(defaultPermissions);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in permissions API:', error);
    
    // Return a default response instead of 500 error
    return NextResponse.json({
      user_email: '',
      role: 'user',
      can_write: false,
      can_grade: false,
      claude_daily_limit: 3
    });
  }
}