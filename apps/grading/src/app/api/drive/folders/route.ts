import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;

    console.log('Access token exists:', !!accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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