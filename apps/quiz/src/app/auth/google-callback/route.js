import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')
  
  console.log('Google callback received:', { code: !!code, state: !!state, error })
  
  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?error=${error}`, requestUrl.origin))
  }
  
  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?error=no_code', requestUrl.origin))
  }
  
  try {
    // state에서 next URL 추출
    let next = '/create'
    if (state) {
      try {
        const stateData = JSON.parse(state)
        next = stateData.next || '/create'
      } catch (e) {
        console.error('Failed to parse state:', e)
      }
    }
    
    // Google OAuth token 교환
    const tokenUrl = 'https://oauth2.googleapis.com/token'
    const tokenParams = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${requestUrl.origin}/auth/google-callback`,
      grant_type: 'authorization_code'
    })
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      throw new Error('Failed to exchange code for token')
    }
    
    const tokens = await tokenResponse.json()
    console.log('Got Google tokens')
    
    // Google 사용자 정보 가져오기
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    })
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info')
    }
    
    const userInfo = await userInfoResponse.json()
    console.log('Got user info:', userInfo.email)
    
    // Supabase 세션 생성
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Cookie set error:', error)
            }
          },
          remove(name, options) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 })
            } catch (error) {
              console.error('Cookie remove error:', error)
            }
          },
        },
      }
    )
    
    // Supabase에서 이메일로 사용자 로그인 또는 생성
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userInfo.email,
      password: `google-oauth-${userInfo.id}` // Google ID를 사용한 임시 비밀번호
    })
    
    if (signInError && signInError.message?.includes('Invalid login credentials')) {
      // 사용자가 없으면 생성
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userInfo.email,
        password: `google-oauth-${userInfo.id}`,
        options: {
          data: {
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
            provider: 'google'
          }
        }
      })
      
      if (signUpError) {
        throw signUpError
      }
      
      console.log('New user created:', userInfo.email)
    } else if (signInError) {
      throw signInError
    } else {
      console.log('User signed in:', userInfo.email)
    }
    
    // 성공 시 리다이렉트
    return NextResponse.redirect(new URL(next, requestUrl.origin))
    
  } catch (error) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }
}