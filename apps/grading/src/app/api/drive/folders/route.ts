import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createClient, createAdminClient } from '@/lib/supabase';

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

    // Skip NextAuth token for now - it doesn't have proper Drive permissions
    let accessToken = null;
    
    console.log('[Drive Folders API] Session info:', {
      hasSession: !!session,
      hasAccessToken: !!session.accessToken,
      userEmail: session.user?.email
    });
    
    // Always get token from database
    {
      // First, let's check if we can get token at all
      console.log('[Drive Folders API] Attempting to fetch token for:', session.user.email);
      
      let tokenData = null;
      let tokenError = null;
      
      try {
        // Try with admin client to bypass RLS
        const supabase = createAdminClient();
        console.log('[Drive Folders API] Using admin client with service role key');
        
        // First check if any tokens exist
        const { data: allTokens, error: checkError } = await supabase
          .from('google_tokens')
          .select('access_token, refresh_token, expires_at, created_at')
          .eq('user_email', session.user.email)
          .order('created_at', { ascending: false });
          
        console.log('[Drive Folders API] Token check:', {
          email: session.user.email,
          tokenCount: allTokens?.length || 0,
          checkError
        });
        
        if (checkError) {
          throw checkError;
        }
        
        // Use the most recent token if multiple exist
        tokenData = allTokens && allTokens.length > 0 ? allTokens[0] : null;
        tokenError = !tokenData ? new Error('No tokens found') : null;
        
        if (tokenError) {
          console.error('[Drive Folders API] Admin client failed:', {
            error: tokenError,
            code: tokenError.code,
            message: tokenError.message,
            details: tokenError.details,
            hint: tokenError.hint
          });
        }
      } catch (e) {
        console.error('[Drive Folders API] Exception during token fetch:', e);
        tokenError = e;
      }

      if (tokenError || !tokenData?.access_token) {
        console.error('[Drive Folders API] Token fetch failed:', {
          error: tokenError?.message || 'No tokens found',
          hasData: !!tokenData,
          hasAccessToken: !!tokenData?.access_token,
          userEmail: session.user.email
        });
        return NextResponse.json({ 
          error: 'Google authentication required',
          details: 'No Google Drive access token found. Please authenticate with Google Drive.',
          needsAuth: true
        }, { status: 401 });
      }
      
      // Check if token is expired
      if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
        console.log('[Drive Folders API] Token expired, needs refresh');
        return NextResponse.json({ 
          error: 'Google authentication required',
          details: 'Access token expired',
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