import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://grading.bluenote.site/api/auth/google/callback'
    : 'http://localhost:3000/api/auth/google/callback');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export async function GET() {
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
  ];

  // 디버깅을 위한 로그
  console.log('OAuth Configuration:', {
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: redirectUri,
    envRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    nodeEnv: process.env.NODE_ENV
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  console.log('Generated auth URL:', authUrl);

  return NextResponse.redirect(authUrl);
}