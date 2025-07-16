import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://grading.bluenote.site/api/auth/google/callback'
    : 'http://localhost:3000/api/auth/google/callback');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  // state에서 assignmentId 추출
  let assignmentId: string | null = null;
  if (state) {
    try {
      const stateData = JSON.parse(state);
      assignmentId = stateData.assignmentId;
    } catch (e) {
      console.error('Failed to parse state:', e);
    }
  }

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://grading.bluenote.site'
    : 'http://localhost:3000';

  const assignmentIdParam = assignmentId ? `&assignmentId=${assignmentId}` : '';

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/import?error=${error}${assignmentIdParam}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/import?error=no_code${assignmentIdParam}`
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('Received tokens:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    });
    
    const cookieStore = await cookies();
    cookieStore.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: false, // Allow HTTP in development
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    if (tokens.refresh_token) {
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: false, // Allow HTTP in development
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return NextResponse.redirect(
      `${baseUrl}/import?success=true${assignmentIdParam}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${baseUrl}/import?error=auth_failed${assignmentIdParam}`
    );
  }
}