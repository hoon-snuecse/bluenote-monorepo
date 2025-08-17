import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminUsersClient from './AdminUsersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getUsers() {
  try {
    console.log('getUsers: Starting to fetch users');
    
    // Try admin client first, fall back to server client if needed
    let supabase;
    try {
      supabase = createAdminClient();
      console.log('getUsers: Using admin client');
    } catch (error) {
      console.log('getUsers: Admin client failed, using server client:', error.message);
      supabase = await createServerClient();
    }
    
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('getUsers: Database error:', error);
      // RLS 에러인 경우 다른 방법 시도
      if (error.code === '42501' || error.message?.includes('permission')) {
        console.log('getUsers: RLS error, trying authenticated query');
        const authClient = await createServerClient();
        const { data: authData, error: authError } = await authClient
          .from('user_permissions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (authError) {
          console.error('getUsers: Auth query also failed:', authError);
          return [];
        }
        return authData || [];
      }
      throw error;
    }
    
    console.log('getUsers: Successfully fetched users:', {
      count: data?.length || 0,
      users: data?.map(u => u.email) || []
    });
    
    return data || [];
  } catch (error) {
    console.error('getUsers: Failed to fetch users:', error.message, error.stack);
    return [];
  }
}

export default async function AdminUsersPage() {
  console.log('AdminUsersPage: Starting render');
  
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  console.log('AdminUsersPage: Auth check:', {
    userEmail: user?.email,
    authError: authError?.message,
    hasUser: !!user
  });
  
  if (!user) {
    console.log('AdminUsersPage: No user found, returning empty client');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <AdminUsersClient initialUsers={[]} initialUser={null} />
        </div>
      </div>
    );
  }
  
  // 권한 확인
  const { data: permissions, error: permError } = await supabase
    .from('user_permissions')
    .select('role, can_write')
    .eq('email', user.email)
    .single();
  
  console.log('AdminUsersPage: Permission check:', {
    permissions,
    permError: permError?.message
  });
  
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
  
  console.log('AdminUsersPage: Admin status:', {
    isAdmin,
    role: permissions?.role,
    isInAdminEmails: adminEmails.includes(user.email)
  });
  
  const userData = {
    ...user,
    isAdmin,
    permissions
  };
  
  // Admin이면 사용자 목록 가져오기
  let users = [];
  if (isAdmin) {
    console.log('AdminUsersPage: User is admin, fetching user list');
    users = await getUsers();
  } else {
    console.log('AdminUsersPage: User is not admin, skipping user list fetch');
  }
  
  console.log('AdminUsersPage: Final data to pass to client:', {
    userCount: users.length,
    userData: {
      email: userData.email,
      isAdmin: userData.isAdmin
    }
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <AdminUsersClient initialUsers={users} initialUser={userData} />
      </div>
    </div>
  );
}