import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API 키 인증 함수
async function authenticateRequest(request) {
  // 1. 세션 기반 인증 (기존 방식)
  const session = await getServerSession(authOptions);
  if (session && session.user.isAdmin) {
    return { authenticated: true, source: 'session' };
  }

  // 2. API 키 인증 (새로 추가)
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey && apiKey === process.env.BLUENOTE_API_KEY) {
    return { authenticated: true, source: 'api_key' };
  }

  return { authenticated: false };
}

export async function GET(request) {
  try {
    const supabase = await createClient();
    
    // 인증 없이도 읽기는 허용 (공개 블로그이므로)
    const { data: posts, error } = await supabase
      .from('shed_posts')
      .select(`
        *,
        shed_post_images (
          id,
          file_path,
          file_name,
          display_order
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
    }

    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      category: post.category,
      content: post.content,
      summary: post.summary,
      tags: post.tags || [],
      readingTime: post.reading_time,
      isAIGenerated: post.is_ai_generated,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      images: post.shed_post_images ? post.shed_post_images.map(img => ({
        id: img.id,
        name: img.file_name,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/shed-images/${img.file_path}`
      })) : []
    }));

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error('Error in GET /api/shed/posts:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // 강화된 인증 체크
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        hint: 'Use session authentication or provide X-API-Key header' 
      }, { status: 401 });
    }

    const supabase = await createClient();
    const data = await request.json();
    
    // Claude 자동 업로드 감지
    const isClaudeUpload = request.headers.get('User-Agent')?.includes('Claude') || 
                          request.headers.get('X-Source') === 'claude';
    
    console.log(`📝 New post via ${auth.source}${isClaudeUpload ? ' (Claude)' : ''}: ${data.title}`);
    
    // 기존 로직과 동일
    const { images, ...postData } = data;
    
    const { data: newPost, error: postError } = await supabase
      .from('shed_posts')
      .insert([{
        title: postData.title,
        category: postData.category,
        content: postData.content,
        summary: postData.summary,
        tags: postData.tags || [],
        reading_time: postData.readingTime,
        is_ai_generated: postData.isAIGenerated || isClaudeUpload || true
      }])
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return NextResponse.json({ 
        error: 'Failed to create post', 
        details: postError.message 
      }, { status: 500 });
    }

    // 이미지 처리 (기존 로직)
    if (images && images.length > 0) {
      const imageRecords = images
        .filter(img => img.path)
        .map((img, index) => ({
          post_id: newPost.id,
          file_path: img.path,
          file_name: img.name || 'untitled',
          file_size: img.size || 0,
          mime_type: img.type || 'image/jpeg',
          display_order: index
        }));

      if (imageRecords.length > 0) {
        const { error: imageError } = await supabase
          .from('shed_post_images')
          .insert(imageRecords);

        if (imageError) {
          console.error('Error saving image metadata:', imageError);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: newPost.id,
      post: newPost,
      url: `https://bluenote.site/shed/${newPost.id}`,
      message: isClaudeUpload ? '✨ Claude 자동 업로드 완료!' : '✅ 포스트 생성 완료!'
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json({ 
      error: 'Failed to save post', 
      details: error.message 
    }, { status: 500 });
  }
}

// PUT, DELETE도 동일하게 인증 추가
export async function PUT(request) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 기존 PUT 로직...
}

export async function DELETE(request) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 기존 DELETE 로직...
}