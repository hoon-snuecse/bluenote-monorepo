import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')

  console.log('Auth callback received:', { 
    origin: requestUrl.origin,
    code: code ? 'present' : 'missing',
    state
  })

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      // state 정보가 있으면 원래 앱으로, 없으면 현재 앱의 에러 페이지로
      if (state) {
        try {
          const stateData = JSON.parse(state)
          return NextResponse.redirect(new URL('/auth/error', stateData.returnTo))
        } catch (e) {
          console.error('Failed to parse state:', e)
        }
      }
      return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
    }
    
    console.log('Session exchanged successfully:', data?.user?.email)
  }

  // state 파라미터에서 원래 앱 정보 추출
  let redirectUrl = new URL('/create', requestUrl.origin)
  
  if (state) {
    try {
      const stateData = JSON.parse(state)
      redirectUrl = new URL(stateData.redirectPath || '/create', stateData.returnTo)
      console.log('Redirecting to original app:', redirectUrl.toString())
    } catch (e) {
      console.error('Failed to parse state:', e)
    }
  }
  
  return NextResponse.redirect(redirectUrl)
}