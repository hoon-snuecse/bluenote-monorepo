import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminContentClient from './AdminContentClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentStats() {
  try {
    console.log('getContentStats: Starting to fetch content stats');
    const supabase = createAdminClient();
    console.log('getContentStats: Admin client created');
    
    const { data, error } = await supabase
      .from('posts')
      .select('section');
    
    if (error) {
      console.error('getContentStats: Database error:', error);
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
    
    console.log('getContentStats: Stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('getContentStats: Failed to fetch stats:', error.message);
    return null;
  }
}

async function getPostsBySection(section) {
  try {
    console.log('getPostsBySection: Fetching posts for section:', section);
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('section', section)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('getPostsBySection: Database error:', error);
      return [];
    }
    
    console.log('getPostsBySection: Fetched posts:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('getPostsBySection: Failed to fetch posts:', error.message);
    return [];
  }
}

export default async function AdminContentPage() {
  console.log('AdminContentPage: Starting render');
  
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  console.log('AdminContentPage: Auth check:', {
    userEmail: user?.email,
    authError: authError?.message,
    hasUser: !!user
  });
  
  if (!user) {
    console.log('AdminContentPage: No user found');
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
  const { data: permissions, error: permError } = await supabase
    .from('user_permissions')
    .select('role')
    .eq('email', user.email)
    .single();
  
  console.log('AdminContentPage: Permission check:', {
    permissions,
    permError: permError?.message
  });
  
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdmin = permissions?.role === 'admin' || adminEmails.includes(user.email);
  
  console.log('AdminContentPage: Admin status:', {
    isAdmin,
    role: permissions?.role,
    isInAdminEmails: adminEmails.includes(user.email)
  });
  
  const userData = {
    ...user,
    isAdmin,
    permissions
  };
  
  // Admin이면 콘텐츠 통계 및 포스트 가져오기
  let stats = null;
  let postsBySection = {};
  
  if (isAdmin) {
    console.log('AdminContentPage: User is admin, fetching content data');
    stats = await getContentStats();
    
    // 모든 섹션의 포스트를 병렬로 가져오기
    const sections = ['research', 'teaching', 'analytics', 'shed'];
    const postsPromises = sections.map(section => getPostsBySection(section));
    const postsResults = await Promise.all(postsPromises);
    
    sections.forEach((section, index) => {
      postsBySection[section] = postsResults[index];
    });
    
    console.log('AdminContentPage: Content data fetched:', {
      hasStats: !!stats,
      postsSections: Object.keys(postsBySection),
      postsCount: Object.values(postsBySection).reduce((acc, posts) => acc + posts.length, 0)
    });
  } else {
    console.log('AdminContentPage: User is not admin, skipping content fetch');
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