import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

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
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  // state에서 assignmentId와 userEmail 추출
  let assignmentId: string | null = null;
  let expectedUserEmail: string | null = null;
  if (state) {
    try {
      const stateData = JSON.parse(state);
      assignmentId = stateData.assignmentId;
      expectedUserEmail = stateData.userEmail;
    } catch (e) {
      console.error('Failed to parse state:', e);
    }
  }

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://grading.bluenote.site'
    : 'http://localhost:3001';

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
    // Get current session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.redirect(
        `${baseUrl}/import?error=not_authenticated${assignmentIdParam}`
      );
    }

    // Verify the user is the same as expected
    if (expectedUserEmail && session.user.email !== expectedUserEmail) {
      console.error('User mismatch:', {
        expected: expectedUserEmail,
        actual: session.user.email
      });
      return NextResponse.redirect(
        `${baseUrl}/import?error=user_mismatch${assignmentIdParam}`
      );
    }

    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('Received tokens for user:', session.user.email, {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    });
    
    // Store tokens in database associated with user using admin client
    const supabase = createAdminClient();
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
    
    console.log('Storing tokens in database for:', session.user.email);
    
    const { error: dbError } = await supabase
      .from('google_tokens')
      .upsert({
        user_email: session.user.email,
        access_token: tokens.access_token || '',
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type || 'Bearer',
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_email'
      });

    if (dbError) {
      console.error('Failed to store tokens:', dbError);
      return NextResponse.redirect(
        `${baseUrl}/import?error=token_storage_failed&details=${encodeURIComponent(dbError.message)}${assignmentIdParam}`
      );
    }

    console.log('Tokens stored successfully, redirecting...');
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