import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/community'

  console.log('=== Quiz app auth callback route ===')
  console.log('Code:', code ? 'present' : 'missing')
  console.log('URL:', requestUrl.toString())

  if (code) {
    const cookieStore = cookies()
    
    // 쿠키 옵션 - httpOnly를 false로 설정하여 클라이언트에서도 접근 가능하게 함
    const getCookieOptions = () => {
      const isProduction = process.env.NODE_ENV === 'production' || 
                          process.env.VERCEL_ENV === 'production'
      return {
        domain: isProduction ? '.bluenote.site' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: isProduction,
        httpOnly: false, // 클라이언트에서 접근 가능하도록 설정
        maxAge: 60 * 60 * 24 * 7 // 7 days
      }
    }
    
    // Supabase 클라이언트 생성
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookieOptions: getCookieOptions(),
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            const cookieOptions = { ...getCookieOptions(), ...options }
            cookieStore.set({ name, value, ...cookieOptions })
          },
          remove(name, options) {
            const cookieOptions = { ...getCookieOptions(), ...options, maxAge: 0 }
            cookieStore.set({ name, value: '', ...cookieOptions })
          }
        }
      }
    )

    // 이전 쿠키 상태 확인
    const beforeCookies = cookieStore.getAll().filter(c => c.name.includes('sb-'))
    console.log('Cookies before exchange:', beforeCookies.map(c => ({ name: c.name, length: c.value.length })))
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Exchange error:', error.message)
      console.error('Exchange error details:', error)
      return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }
    
    console.log('Auth success - session created:', !!data?.session)
    console.log('Session user:', data?.session?.user?.email)
    console.log('Session access token exists:', !!data?.session?.access_token)
    console.log('Session refresh token exists:', !!data?.session?.refresh_token)
    
    // 세션 쿠키 직접 확인
    const { data: { session: verifySession } } = await supabase.auth.getSession()
    console.log('Verify session after exchange:', !!verifySession)
    
    // 성공 시 리다이렉트
    const response = NextResponse.redirect(new URL(next, requestUrl.origin))
    
    // 디버그: 쿠키 확인
    const afterCookies = cookieStore.getAll().filter(c => c.name.includes('sb-'))
    console.log('Cookies after exchange:', afterCookies.map(c => ({ name: c.name, length: c.value.length })))
    
    return response
  }

  // code가 없으면 클라이언트 측 처리를 위한 HTML 반환
  // Implicit flow의 경우 토큰이 URL fragment에 있어서 서버에서 접근 불가
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Processing authentication...</title>
        <script type="module">
          // Implicit flow 처리
          const hash = window.location.hash;
          if (hash && hash.includes('access_token')) {
            console.log('Implicit flow tokens detected in fragment');
            // 클라이언트 핸들러 페이지로 리다이렉트
            window.location.href = '/auth/callback/handler' + window.location.search + window.location.hash;
          } else {
            // 토큰이 없으면 에러 페이지로
            window.location.href = '/auth/error?error=no_auth_code_or_token';
          }
        </script>
      </head>
      <body>
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
          <p>Processing authentication...</p>
        </div>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}