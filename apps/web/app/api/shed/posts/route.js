import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import * as memoryAPI from './local/route.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const POSTS_FILE = path.join(process.cwd(), 'data', 'shed-posts.json');

// Check if we're running on Vercel
const IS_VERCEL = process.env.VERCEL === '1';

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load posts from file
async function loadPosts() {
  await ensureDataDir();
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save posts to file
async function savePosts(posts) {
  await ensureDataDir();
  
  // Check total file size before saving
  const dataString = JSON.stringify(posts, null, 2);
  const fileSizeInMB = Buffer.byteLength(dataString) / (1024 * 1024);
  
  if (fileSizeInMB > 10) { // 10MB limit for total file
    // Keep only recent posts if file is too large
    const recentPosts = posts.slice(0, 20); // Keep only 20 most recent posts
    await fs.writeFile(POSTS_FILE, JSON.stringify(recentPosts, null, 2));
    console.log(`File too large (${fileSizeInMB.toFixed(2)}MB), kept only 20 most recent posts`);
  } else {
    await fs.writeFile(POSTS_FILE, dataString);
  }
}

export async function GET(request) {
  // Use memory storage on Vercel
  if (IS_VERCEL) {
    return memoryAPI.GET(request);
  }
  
  try {
    const posts = await loadPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}

export async function POST(request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  // Use memory storage on Vercel
  if (IS_VERCEL) {
    return memoryAPI.POST(request);
  }
  
  try {
    const data = await request.json();
    
    // Check if data size is too large (rough estimate)
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 1024 * 1024) { // 1MB limit for single post
      return NextResponse.json({ 
        error: 'Post data too large', 
        details: 'Please reduce image sizes or remove some images' 
      }, { status: 413 });
    }
    
    const posts = await loadPosts();
    
    // Generate unique ID - convert to ASCII-only slug
    const slug = data.title
      .toLowerCase()
      .replace(/[가-힣]/g, '') // Remove Korean characters
      .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 30);
    
    const id = `${Date.now()}${slug ? '-' + slug : ''}`;
    
    const newPost = {
      id,
      ...data,
      createdAt: data.createdAt || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      updatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };
    
    // Add to beginning of array (newest first)
    posts.unshift(newPost);
    
    await savePosts(posts);
    
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
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  // Use memory storage on Vercel
  if (IS_VERCEL) {
    return memoryAPI.PUT(request);
  }
  
  try {
    const data = await request.json();
    
    // Log the incoming data size
    const dataSize = JSON.stringify(data).length;
    console.log(`PUT request data size: ${(dataSize / 1024).toFixed(2)}KB`);
    
    // Check if data size is too large
    if (dataSize > 512 * 1024) { // 512KB limit for updates
      return NextResponse.json({ 
        error: 'Post data too large', 
        details: 'Please reduce image sizes or remove some images. Maximum size: 512KB' 
      }, { status: 413 });
    }
    
    const { id, ...updateData } = data;
    
    // Load current posts
    const posts = await loadPosts();
    console.log(`Current posts file has ${posts.length} posts`);
    
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      console.error(`Post not found with id: ${id}`);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Update the post
    const oldPostSize = JSON.stringify(posts[index]).length;
    posts[index] = {
      ...posts[index],
      ...updateData,
      updatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };
    const newPostSize = JSON.stringify(posts[index]).length;
    
    console.log(`Post ${id} size changed from ${(oldPostSize / 1024).toFixed(2)}KB to ${(newPostSize / 1024).toFixed(2)}KB`);
    
    // Check total file size before saving
    const totalSize = JSON.stringify(posts).length;
    console.log(`Total file size before save: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    
    if (totalSize > 2 * 1024 * 1024) { // 2MB limit
      // Remove oldest posts if file is too large
      const sortedPosts = posts.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      
      // Keep the post we just updated plus 10 more recent posts
      const updatedPost = sortedPosts.find(p => p.id === id);
      const otherPosts = sortedPosts.filter(p => p.id !== id).slice(0, 10);
      const trimmedPosts = [updatedPost, ...otherPosts];
      
      console.log(`File too large, trimming from ${posts.length} to ${trimmedPosts.length} posts`);
      
      await savePosts(trimmedPosts);
      
      return NextResponse.json({ 
        success: true, 
        post: updatedPost,
        warning: 'Older posts were removed to save space'
      });
    }
    
    await savePosts(posts);
    
    return NextResponse.json({ 
      success: true, 
      post: posts[index] 
    });
  } catch (error) {
    console.error('Error updating post - Full details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error messages
    if (error.message.includes('JSON')) {
      return NextResponse.json({ 
        error: 'Failed to process post data', 
        details: 'The post data appears to be corrupted. Please try again.' 
      }, { status: 500 });
    }
    
    if (error.code === 'ENOSPC') {
      return NextResponse.json({ 
        error: 'Storage full', 
        details: 'The server storage is full. Please contact the administrator.' 
      }, { status: 507 });
    }
    
    if (error.code === 'EACCES') {
      return NextResponse.json({ 
        error: 'Permission denied', 
        details: 'Unable to save the post due to file permissions.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update post', 
      details: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  // Use memory storage on Vercel
  if (IS_VERCEL) {
    return memoryAPI.DELETE(request);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }
    
    const posts = await loadPosts();
    const filteredPosts = posts.filter(p => p.id !== id);
    
    if (posts.length === filteredPosts.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    await savePosts(filteredPosts);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}