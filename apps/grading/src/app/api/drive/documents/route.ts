import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  console.log('[Drive Documents API] Request received');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId');
    const driveType = searchParams.get('driveType');

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID required' }, { status: 400 });
    }

    // Get current session with extended type
    const session = await getServerSession() as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[Drive Documents API] Getting tokens for user:', session.user.email);
    
    // Skip NextAuth token for now - it doesn't have proper Drive permissions
    let accessToken = null;
    let tokenData = null;
    
    // Always get token from database
    {
      const supabase = createAdminClient();
      const { data, error: tokenError } = await supabase
        .from('google_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('user_email', session.user.email)
        .single();
      
      tokenData = data;
      
      console.log('[Drive Documents API] Token query result:', {
        hasData: !!tokenData,
        hasAccessToken: !!tokenData?.access_token,
        error: tokenError?.message
      });

      if (tokenError || !tokenData?.access_token) {
        accessToken = null;
      } else {
        accessToken = tokenData.access_token;
      }
    }

    if (!accessToken) {
      console.error('[Drive Documents API] No token available');
      return NextResponse.json({ 
        error: 'Google authentication required',
        details: 'No access token found'
      }, { status: 401 });
    }


    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Validate folderId to prevent injection
    const isValidFolderId = (id: string) => {
      // Google Drive IDs are alphanumeric with hyphens and underscores
      return /^[a-zA-Z0-9_-]+$/.test(id) || id === 'my-drive' || id === 'shared-with-me' || id === 'root';
    };
    
    if (folderId && !isValidFolderId(folderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid folder ID format' },
        { status: 400 }
      );
    }
    
    // Escape single quotes in folderId for safety
    const escapedFolderId = folderId ? folderId.replace(/'/g, "\\'"): '';
    
    let query = '';
    let includeTeamDrives = false;
    let corpora = 'user';

    // Handle different drive types
    if (driveType === 'my-drive') {
      // For "내 드라이브", show root folders and files
      if (folderId === 'my-drive') {
        query = "'root' in parents and trashed=false";
      } else {
        query = `'${escapedFolderId}' in parents and trashed=false`;
      }
    } else if (driveType === 'shared-drive') {
      // For shared drives
      query = `'${escapedFolderId}' in parents and trashed=false`;
      includeTeamDrives = true;
      corpora = 'drive';
    } else if (driveType === 'shared-with-me') {
      // For "공유 문서함", show all shared items
      if (folderId === 'shared-with-me') {
        query = "sharedWithMe and trashed=false";
      } else {
        query = `'${escapedFolderId}' in parents and trashed=false`;
      }
    } else {
      // Default behavior for regular folders
      query = `'${escapedFolderId}' in parents and trashed=false`;
    }

    console.log('[Drive Documents API] Query:', query);
    console.log('[Drive Documents API] Options:', { includeTeamDrives, corpora, driveType });
    
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
    
    console.log('[Drive Documents API] Response received, files count:', response.data.files?.length || 0);

    // Add metadata to files
    const files = (response.data.files || []).map(file => ({
      ...file,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
      driveType: driveType || 'unknown',
    }));

    console.log('[Drive Documents API] Returning', files.length, 'files');
    return NextResponse.json({ files });
  } catch (error) {
    console.error('[Drive Documents API] Error:', error);
    if (error instanceof Error) {
      console.error('[Drive Documents API] Error message:', error.message);
      console.error('[Drive Documents API] Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}