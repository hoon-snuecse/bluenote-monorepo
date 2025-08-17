import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminUsersClient from './AdminUsersClient';

async function getUsers() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export default async function AdminUsersServer() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <AdminUsersClient initialUsers={[]} initialUser={null} />;
  }
  
  // 권한 확인
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('role, can_write')
    .eq('email', user.email)
    .single();
  
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
  
  const userData = {
    ...user,
    isAdmin,
    permissions
  };
  
  // Admin이면 사용자 목록 가져오기
  const users = isAdmin ? await getUsers() : [];
  
  return <AdminUsersClient initialUsers={users} initialUser={userData} />;
}