import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// This endpoint just generates a signed URL for direct upload
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
    const { fileName, fileType } = await request.json();
    
    if (!fileName) {
      return NextResponse.json({ error: 'No file name provided' }, { status: 400 });
    }

    // Generate unique file name
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const folder = fileType === 'document' ? 'documents' : 'images';
    const filePath = `temp/${folder}/${uniqueFileName}`;

    // Create a signed URL for upload
    const { data, error } = await supabase.storage
      .from('research-images')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json({ 
        error: 'Failed to create upload URL', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      path: filePath,
      token: data.token
    });
  } catch (error) {
    console.error('Error in upload-direct:', error);
    return NextResponse.json({ 
      error: 'Failed to create upload URL', 
      details: error.message 
    }, { status: 500 });
  }
}