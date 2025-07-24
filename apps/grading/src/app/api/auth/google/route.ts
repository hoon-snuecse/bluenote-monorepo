import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

const redirectUri = process.env.NODE_ENV === 'production' 
  ? process.env.GOOGLE_REDIRECT_URI || 'https://grading.bluenote.site/api/auth/google/callback'
  : process.env.GOOGLE_REDIRECT_URI_DEV || 'http://localhost:3001/api/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export async function GET(request: NextRequest) {
  // Check current session first
  const session = await getServerSession() as any;
  if (!session?.user?.email) {
    // Redirect to main site login if not authenticated
    const returnUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(`https://bluenote.site/auth/signin?callbackUrl=${returnUrl}`);
  }

  const searchParams = request.nextUrl.searchParams;
  const assignmentId = searchParams.get('assignmentId');
  
  // If session has Google access token, skip OAuth flow
  if (session.accessToken) {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://grading.bluenote.site'
      : 'http://localhost:3001';
    const assignmentIdParam = assignmentId ? `&assignmentId=${assignmentId}` : '';
    return NextResponse.redirect(`${baseUrl}/import?success=true${assignmentIdParam}`);
  }
  
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
  ];

  // state에 assignmentId와 현재 사용자 이메일 포함
  const state = JSON.stringify({ 
    assignmentId,
    userEmail: session.user.email 
  });

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
    prompt: 'select_account', // 계정 선택 화면 표시
    redirect_uri: redirectUri,
    state: state,
    login_hint: session.user.email // 현재 로그인한 사용자 이메일 힌트
  });

  console.log('Generated auth URL:', authUrl);

  return NextResponse.redirect(authUrl);
}