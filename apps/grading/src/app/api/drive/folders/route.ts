import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

export async function GET() {
  console.log('[Drive Folders API] Request received');
  
  try {
    // Get current session with extended type
    const session = await getServerSession() as any;
    if (!session?.user?.email) {
      console.error('[Drive Folders API] No session found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    console.log('[Drive Folders API] Current user:', session.user.email);

    // First try to use NextAuth session token
    let accessToken = session.accessToken;
    
    console.log('[Drive Folders API] Session info:', {
      hasSession: !!session,
      hasAccessToken: !!session.accessToken,
      userEmail: session.user?.email
    });
    
    // If no token in session, try to get from database
    if (!accessToken) {
      const supabase = createClient();
      const { data: tokenData, error: tokenError } = await supabase
        .from('google_tokens')
        .select('access_token')
        .eq('user_email', session.user.email)
        .single();

      if (tokenError || !tokenData?.access_token) {
        console.error('[Drive Folders API] No token available:', tokenError);
        console.log('[Drive Folders API] Session details:', JSON.stringify(session, null, 2));
        return NextResponse.json({ 
          error: 'Google authentication required',
          details: 'No access token in session or database',
          hasSessionToken: false
        }, { status: 401 });
      }
      
      accessToken = tokenData.access_token;
    }
    
    console.log('[Drive Folders API] Token found');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    console.log('[Drive Folders API] OAuth client configured');

    // Get shared drives
    const sharedDrives = await drive.drives.list({
      pageSize: 100,
      fields: 'drives(id, name)',
    });

    // Create virtual root folders
    const rootFolders = [
      {
        id: 'my-drive',
        name: '내 드라이브',
        mimeType: 'application/vnd.google-apps.folder',
        isRoot: true,
        driveType: 'my-drive',
      },
      ...(sharedDrives.data.drives || []).map(drive => ({
        id: drive.id,
        name: drive.name,
        mimeType: 'application/vnd.google-apps.folder',
        isRoot: true,
        driveType: 'shared-drive',
      })),
      {
        id: 'shared-with-me',
        name: '공유 문서함',
        mimeType: 'application/vnd.google-apps.folder',
        isRoot: true,
        driveType: 'shared-with-me',
      },
    ];

    return NextResponse.json({ files: rootFolders });
  } catch (error: any) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch folders',
        details: error.message || 'Unknown error',
        code: error.code
      },
      { status: 500 }
    );
  }
}