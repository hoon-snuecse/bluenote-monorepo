import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create Supabase client with service role
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Fetch all users
    const { data: users, error } = await supabase
      .from('user_permissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[Admin Users API] Error:', error);
      return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    
    // Transform user_email to email for compatibility
    const transformedUsers = (users || []).map(user => ({
      ...user,
      email: user.user_email || user.email
    }));
    
    return Response.json({ 
      users: transformedUsers,
      count: transformedUsers.length
    });
    
  } catch (error) {
    console.error('[Admin Users API] Error:', error);
    return Response.json({ 
      error: 'Failed to fetch users',
      details: error.message 
    }, { status: 500 });
  }
}