import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId');
    const driveType = searchParams.get('driveType');

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID required' }, { status: 400 });
    }

    // Get current session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's Google token from database
    const supabase = createClient();
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_email', session.user.email)
      .single();

    if (tokenError || !tokenData?.access_token) {
      return NextResponse.json({ error: 'Google authentication required' }, { status: 401 });
    }

    const accessToken = tokenData.access_token;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    let query = '';
    let includeTeamDrives = false;
    let corpora = 'user';

    // Handle different drive types
    if (driveType === 'my-drive') {
      // For "내 드라이브", show root folders and files
      if (folderId === 'my-drive') {
        query = "'root' in parents and trashed=false";
      } else {
        query = `'${folderId}' in parents and trashed=false`;
      }
    } else if (driveType === 'shared-drive') {
      // For shared drives
      query = `'${folderId}' in parents and trashed=false`;
      includeTeamDrives = true;
      corpora = 'drive';
    } else if (driveType === 'shared-with-me') {
      // For "공유 문서함", show all shared items
      if (folderId === 'shared-with-me') {
        query = "sharedWithMe and trashed=false";
      } else {
        query = `'${folderId}' in parents and trashed=false`;
      }
    } else {
      // Default behavior for regular folders
      query = `'${folderId}' in parents and trashed=false`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, modifiedTime, owners, parents)',
      orderBy: 'folder,name',
      pageSize: 100,
      ...(includeTeamDrives && { 
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        corpora: corpora,
        driveId: folderId
      }),
    });

    // Add metadata to files
    const files = (response.data.files || []).map(file => ({
      ...file,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
      driveType: driveType || 'unknown',
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}