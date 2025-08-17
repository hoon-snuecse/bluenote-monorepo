import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminContentClient from './AdminContentClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentStats(fallbackClient = null) {
  try {
    let supabase;
    
    // Try to use admin client, fallback to regular client if service key not available
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        supabase = createAdminClient();
      } else {
        console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using fallback client');
        supabase = fallbackClient;
        if (!supabase) return null;
      }
    } catch (adminError) {
      console.error('Error creating admin client:', adminError);
      supabase = fallbackClient;
      if (!supabase) return null;
    }
    
    const { data, error } = await supabase
      .from('posts')
      .select('section');
    
    if (error) {
      console.error('Error fetching content stats:', error);
      return null;
    }
    
    const stats = {
      research: 0,
      teaching: 0,
      analytics: 0,
      shed: 0,
      total: 0
    };
    
    data?.forEach(post => {
      if (stats.hasOwnProperty(post.section)) {
        stats[post.section]++;
        stats.total++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Failed to fetch content stats:', error);
    return null;
  }
}

async function getPostsBySection(section, fallbackClient = null) {
  try {
    let supabase;
    
    // Try to use admin client, fallback to regular client if service key not available
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        supabase = createAdminClient();
      } else {
        console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using fallback client');
        supabase = fallbackClient;
        if (!supabase) return [];
      }
    } catch (adminError) {
      console.error('Error creating admin client:', adminError);
      supabase = fallbackClient;
      if (!supabase) return [];
    }
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('section', section)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts by section:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch posts by section:', error);
    return [];
  }
}

export default async function AdminContentPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <AdminContentClient 
            initialUser={null}
            initialStats={null}
            initialPosts={{}}
          />
        </div>
      </div>
    );
  }
  
  // 권한 확인
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('role')
    .eq('email', user.email)
    .single();
  
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
  
  const userData = {
    ...user,
    isAdmin,
    permissions
  };
  
  // Admin이면 콘텐츠 통계 및 포스트 가져오기
  let stats = null;
  let postsBySection = {};
  
  if (isAdmin) {
    stats = await getContentStats(supabase);
    
    // 모든 섹션의 포스트를 병렬로 가져오기
    const sections = ['research', 'teaching', 'analytics', 'shed'];
    const postsPromises = sections.map(section => getPostsBySection(section, supabase));
    const postsResults = await Promise.all(postsPromises);
    
    sections.forEach((section, index) => {
      postsBySection[section] = postsResults[index];
    });
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <AdminContentClient 
          initialUser={userData}
          initialStats={stats}
          initialPosts={postsBySection}
        />
      </div>
    </div>
  );
}