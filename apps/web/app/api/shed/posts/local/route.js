import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// This is a fallback API that stores data in memory
// Use only for testing when file system fails
let memoryPosts = [];

export async function GET() {
  return NextResponse.json({ 
    posts: memoryPosts,
    warning: 'Using temporary memory storage - data will be lost on server restart'
  });
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    
    const slug = data.title
      .toLowerCase()
      .replace(/[가-힣]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
    
    const id = `${Date.now()}${slug ? '-' + slug : ''}`;
    
    const newPost = {
      id,
      ...data,
      createdAt: data.createdAt || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      updatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };
    
    memoryPosts.unshift(newPost);
    
    // Keep only last 10 posts in memory
    if (memoryPosts.length > 10) {
      memoryPosts = memoryPosts.slice(0, 10);
    }
    
    return NextResponse.json({ 
      success: true, 
      id: newPost.id,
      post: newPost,
      warning: 'Data stored in memory only - will be lost on server restart'
    });
  } catch (error) {
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
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;
    
    const index = memoryPosts.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    memoryPosts[index] = {
      ...memoryPosts[index],
      ...updateData,
      updatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };
    
    return NextResponse.json({ 
      success: true, 
      post: memoryPosts[index],
      warning: 'Data stored in memory only - will be lost on server restart'
    });
  } catch (error) {
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
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }
    
    const initialLength = memoryPosts.length;
    memoryPosts = memoryPosts.filter(p => p.id !== id);
    
    if (memoryPosts.length === initialLength) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      warning: 'Deleted from memory only - change is temporary'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to delete post', 
      details: error.message 
    }, { status: 500 });
  }
}