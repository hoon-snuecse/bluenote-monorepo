import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { createAdminClient } from '@/lib/supabase'

export async function getGoogleClient(userEmail: string): Promise<OAuth2Client | null> {
  try {
    const supabase = createAdminClient()
    
    // 사용자의 Google 토큰 조회
    const { data: tokenData, error } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_email', userEmail)
      .single()

    if (error || !tokenData) {
      console.error('No Google token found for user:', userEmail)
      return null
    }

    // OAuth2 클라이언트 생성
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // 토큰 설정
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_type: tokenData.token_type,
      expiry_date: tokenData.expiry_date
    })

    // 토큰 갱신이 필요한 경우 자동으로 처리
    oauth2Client.on('tokens', async (tokens) => {
      console.log('Token refreshed for user:', userEmail)
      
      // 새 토큰을 데이터베이스에 저장
      await supabase
        .from('google_tokens')
        .update({
          access_token: tokens.access_token,
          expiry_date: tokens.expiry_date,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', userEmail)
    })

    return oauth2Client
  } catch (error) {
    console.error('Error getting Google client:', error)
    return null
  }
}