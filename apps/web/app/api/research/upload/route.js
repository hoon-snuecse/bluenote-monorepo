import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get('file');
    const postId = formData.get('postId'); // Optional, for direct post association
    const fileType = formData.get('fileType'); // 'document' or 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const folder = fileType === 'document' ? 'documents' : 'images';
    const filePath = postId ? `posts/${postId}/${folder}/${fileName}` : `temp/${folder}/${fileName}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('research-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ 
        error: 'Failed to upload image', 
        details: error.message 
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('research-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: filePath,
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Error in upload:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image', 
      details: error.message 
    }, { status: 500 });
  }
}

// Delete uploaded image
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

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    const { error } = await supabase.storage
      .from('research-images')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ 
        error: 'Failed to delete image', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete:', error);
    return NextResponse.json({ 
      error: 'Failed to delete image', 
      details: error.message 
    }, { status: 500 });
  }
}