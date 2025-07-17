import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const redirectUri = process.env.NODE_ENV === 'production' 
  ? process.env.GOOGLE_REDIRECT_URI || 'https://grading.bluenote.site/api/auth/google/callback'
  : process.env.GOOGLE_REDIRECT_URI_DEV || 'http://localhost:3001/api/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assignmentId = searchParams.get('assignmentId');
  
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
  ];

  // state에 assignmentId 포함
  const state = assignmentId ? JSON.stringify({ assignmentId }) : undefined;

  // 디버깅을 위한 로그
  console.log('OAuth Configuration:', {
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: redirectUri,
    envRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    nodeEnv: process.env.NODE_ENV,
    assignmentId: assignmentId
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    redirect_uri: redirectUri, // 명시적으로 redirect_uri 설정
    state: state
  });

  console.log('Generated auth URL:', authUrl);

  return NextResponse.redirect(authUrl);
}