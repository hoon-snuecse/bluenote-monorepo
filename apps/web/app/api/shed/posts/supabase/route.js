import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    // Debug: Check environment variables
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const supabase = await createClient();
    
    // Fetch posts with their images
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

    // Debug log
    console.log('Raw posts from Supabase:', JSON.stringify(posts[0], null, 2));
    
    // Transform the data to match the existing format
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.isAdmin && !session.user.canWrite) {
      return NextResponse.json({ error: 'Forbidden - Admin access or write permission required' }, { status: 403 });
    }

    const supabase = await createClient();
    const data = await request.json();
    
    // Extract images from the data
    const { images, ...postData } = data;
    
    // Insert the post
    const { data: newPost, error: postError } = await supabase
      .from('shed_posts')
      .insert([{
        title: postData.title,
        category: postData.category,
        content: postData.content,
        summary: postData.summary,
        tags: postData.tags || [],
        reading_time: postData.readingTime,
        is_ai_generated: postData.isAIGenerated || false
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

    // If there are images, save their metadata
    if (images && images.length > 0) {
      const imageRecords = images
        .filter(img => img.path) // path가 있는 이미지만 필터링
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
          // Don't fail the whole operation if image metadata fails
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: newPost.id,
      post: newPost 
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json({ 
      error: 'Failed to save post', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.isAdmin && !session.user.canWrite) {
      return NextResponse.json({ error: 'Forbidden - Admin access or write permission required' }, { status: 403 });
    }

    const supabase = await createClient();
    const data = await request.json();
    const { id, images, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    // Debug log
    console.log('Update data received:', {
      tags: updateData.tags,
      tagsType: Array.isArray(updateData.tags) ? 'array' : typeof updateData.tags,
      tagsLength: updateData.tags ? updateData.tags.length : 0
    });

    // Update the post
    const { data: updatedPost, error: updateError } = await supabase
      .from('shed_posts')
      .update({
        title: updateData.title,
        category: updateData.category,
        content: updateData.content,
        summary: updateData.summary,
        tags: updateData.tags || [],
        reading_time: updateData.readingTime,
        is_ai_generated: updateData.isAIGenerated || false
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      console.error('Error updating post:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update post', 
        details: updateError.message 
      }, { status: 500 });
    }

    // Handle image updates
    if (images !== undefined) {
      // Delete existing image records
      await supabase
        .from('shed_post_images')
        .delete()
        .eq('post_id', id);

      // Insert new image records
      if (images && images.length > 0) {
        const imageRecords = images
          .filter(img => img.path) // path가 있는 이미지만 필터링
          .map((img, index) => ({
            post_id: id,
            file_path: img.path,
            file_name: img.name || 'untitled',
            file_size: img.size || 0,
            mime_type: img.type || 'image/jpeg',
            display_order: index
          }));

        const { error: imageError } = await supabase
          .from('shed_post_images')
          .insert(imageRecords);

        if (imageError) {
          console.error('Error updating image metadata:', imageError);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      post: updatedPost 
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ 
      error: 'Failed to update post', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.isAdmin && !session.user.canWrite) {
      return NextResponse.json({ error: 'Forbidden - Admin access or write permission required' }, { status: 403 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    // First, get the images associated with this post
    const { data: images } = await supabase
      .from('shed_post_images')
      .select('file_path')
      .eq('post_id', id);

    // Delete images from storage
    if (images && images.length > 0) {
      const filePaths = images.map(img => img.file_path);
      const { error: storageError } = await supabase.storage
        .from('shed-images')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting images from storage:', storageError);
      }
    }

    // Delete the post (images will be cascade deleted)
    const { error } = await supabase
      .from('shed_posts')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}