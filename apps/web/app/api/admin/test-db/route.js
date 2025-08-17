import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
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
    
    // Test user_permissions table
    const { data: users, error: usersError } = await supabase
      .from('user_permissions')
      .select('email, role, created_at')
      .limit(5);
    
    // Test if login_logs exists
    const { data: loginLogs, error: loginError } = await supabase
      .from('login_logs')
      .select('*')
      .limit(1);
    
    // Test if grading_logs exists  
    const { data: gradingLogs, error: gradingError } = await supabase
      .from('grading_logs')
      .select('*')
      .limit(1);
    
    return Response.json({
      success: true,
      tables: {
        user_permissions: {
          count: users?.length || 0,
          sample: users?.slice(0, 2),
          error: usersError?.message
        },
        login_logs: {
          exists: !loginError || loginError.code !== '42P01',
          error: loginError?.message
        },
        grading_logs: {
          exists: !gradingError || gradingError.code !== '42P01', 
          error: gradingError?.message
        }
      },
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}