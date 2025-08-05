import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    console.log('[test-jwt] Starting JWT verification test')
    
    // 세션 확인
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }
    
    // NextAuth 세션 정보
    console.log('[test-jwt] Session:', {
      user: session.user,
      expires: session.expires
    })
    
    // 쿠키에서 JWT 토큰 추출
    const cookies = request.headers.get('cookie') || ''
    const sessionToken = cookies
      .split(';')
      .find(c => c.trim().startsWith('next-auth.session-token='))
      ?.split('=')[1]
    
    console.log('[test-jwt] Session token found:', !!sessionToken)
    
    let decodedToken = null
    if (sessionToken) {
      try {
        // JWT 디코드 (검증 없이)
        decodedToken = jwt.decode(sessionToken)
        console.log('[test-jwt] Decoded JWT:', decodedToken)
      } catch (error) {
        console.error('[test-jwt] JWT decode error:', error)
      }
    }
    
    // Supabase에서 JWT 읽기 테스트
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Supabase에서 auth.jwt() 함수 테스트
    const testQuery = `
      SELECT 
        auth.uid() as auth_uid,
        auth.email() as auth_email,
        auth.jwt() as jwt_data,
        auth.jwt() ->> 'email' as jwt_email,
        auth.jwt() ->> 'sub' as jwt_sub,
        current_setting('request.jwt.claim.email', true) as jwt_claim_email,
        current_setting('app.current_user_email', true) as current_user_email
    `
    
    // Authorization 헤더로 JWT 전달
    const authHeader = sessionToken ? `Bearer ${sessionToken}` : null
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/test_jwt_auth`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': authHeader || `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({})
    })
    
    const supabaseResult = await response.json()
    console.log('[test-jwt] Supabase JWT test result:', supabaseResult)
    
    return NextResponse.json({
      nextauth: {
        session: {
          user: session.user,
          expires: session.expires
        },
        jwt: {
          found: !!sessionToken,
          decoded: decodedToken
        }
      },
      supabase: {
        test_result: supabaseResult,
        status: response.status
      },
      recommendations: {
        jwt_field_available: decodedToken?.email ? 'Yes - email field exists in JWT' : 'No - email field not found',
        can_use_jwt_auth: response.status === 200 ? 'Yes' : 'No'
      }
    })
    
  } catch (error) {
    console.error('[test-jwt] Unexpected error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}