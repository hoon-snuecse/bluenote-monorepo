import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminDashboardClient from './AdminDashboardClient';

async function getAdminStats(fallbackClient = null) {
  try {
    let supabase;
    
    // Try to use admin client, fallback to regular client if service key not available
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        supabase = createAdminClient();
      } else {
        console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using fallback client');
        supabase = fallbackClient;
        if (!supabase) {
          return {
            totalUsers: 0,
            totalPosts: 0,
            todayLogs: 0,
            users: []
          };
        }
      }
    } catch (adminError) {
      console.error('Error creating admin client:', adminError);
      supabase = fallbackClient;
      if (!supabase) {
        return {
          totalUsers: 0,
          totalPosts: 0,
          todayLogs: 0,
          users: []
        };
      }
    }
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
    
    // Check for errors in results
    if (usersResult.error) {
      console.error('Error fetching users:', usersResult.error);
    }
    if (postsResult.error) {
      console.error('Error fetching posts:', postsResult.error);
    }
    if (logsResult.error) {
      console.error('Error fetching logs:', logsResult.error);
    }
    
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
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return <AdminDashboardClient initialStats={null} initialUser={null} />;
    }
    
    if (!user) {
      return <AdminDashboardClient initialStats={null} initialUser={null} />;
    }
    
    // 권한 확인
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select('role, can_write')
      .eq('email', user.email)
      .single();
    
    if (permError && permError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching permissions:', permError);
    }
    
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
    const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
    
    const userData = {
      ...user,
      isAdmin,
      permissions
    };
    
    // Admin이면 통계 데이터 가져오기
    const stats = isAdmin ? await getAdminStats(supabase) : null;
    
    return <AdminDashboardClient initialStats={stats} initialUser={userData} />;
  } catch (error) {
    console.error('Error in AdminDashboardServer:', error);
    // Return fallback component on error
    return <AdminDashboardClient initialStats={null} initialUser={null} />;
  }
}