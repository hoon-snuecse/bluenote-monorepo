import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminDashboardClient from './AdminDashboardClient';

async function getAdminStats() {
  try {
    const supabase = createAdminClient();
    const koreaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const todayStart = new Date(koreaTime.setHours(0, 0, 0, 0)).toISOString();
    
    // 병렬로 데이터 조회
    const [usersResult, postsResult, logsResult] = await Promise.all([
      supabase.from('user_permissions').select('*'),
      supabase.from('posts').select('id'),
      supabase.from('claude_usage_logs')
        .select('id')
        .gte('created_at', todayStart)
    ]);
    
    return {
      totalUsers: usersResult.data?.length || 0,
      totalPosts: postsResult.data?.length || 0,
      todayLogs: logsResult.data?.length || 0,
      users: usersResult.data || []
    };
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return {
      totalUsers: 0,
      totalPosts: 0,
      todayLogs: 0,
      users: []
    };
  }
}

export default async function AdminDashboardServer() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <AdminDashboardClient initialStats={null} initialUser={null} />;
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
  
  // Admin이면 통계 데이터 가져오기
  const stats = isAdmin ? await getAdminStats() : null;
  
  return <AdminDashboardClient initialStats={stats} initialUser={userData} />;
}