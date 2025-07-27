import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const debug = {
      timestamp: new Date().toISOString(),
      posts: {},
      users: {}
    };

    // 1. 각 테이블별로 포스트 가져오기 테스트
    try {
      const { data: research, error: researchError } = await supabase
        .from('research_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      debug.posts.research = {
        success: !researchError,
        error: researchError?.message,
        count: research?.length || 0,
        data: research || []
      };
    } catch (e) {
      debug.posts.research = { error: e.message, exception: true };
    }

    try {
      const { data: shed, error: shedError } = await supabase
        .from('shed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      debug.posts.shed = {
        success: !shedError,
        error: shedError?.message,
        count: shed?.length || 0,
        data: shed || []
      };
    } catch (e) {
      debug.posts.shed = { error: e.message, exception: true };
    }

    // 2. user_permissions 테스트
    try {
      const { data: users, error: usersError } = await supabase
        .from('user_permissions')
        .select('*')
        .limit(5);
      
      debug.users = {
        success: !usersError,
        error: usersError?.message,
        count: users?.length || 0,
        data: users || []
      };
    } catch (e) {
      debug.users = { error: e.message, exception: true };
    }

    // 3. 합친 결과 테스트
    const allPosts = [];
    
    if (debug.posts.research.data) {
      debug.posts.research.data.forEach(post => {
        allPosts.push({ ...post, section: 'research' });
      });
    }
    
    if (debug.posts.shed.data) {
      debug.posts.shed.data.forEach(post => {
        allPosts.push({ ...post, section: 'shed' });
      });
    }
    
    // 날짜 정렬
    allPosts.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0);
      const dateB = new Date(b.created_at || b.date || 0);
      return dateB - dateA;
    });
    
    debug.combinedPosts = {
      totalCount: allPosts.length,
      recent5: allPosts.slice(0, 5)
    };

    return NextResponse.json(debug);

  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug API Error', 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}