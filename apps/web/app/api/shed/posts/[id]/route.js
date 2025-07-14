import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'shed-posts.json');

// Load posts from file
async function loadPosts() {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const posts = await loadPosts();
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}