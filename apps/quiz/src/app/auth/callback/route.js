import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/create'

  console.log('=== Quiz app auth callback route ===')
  console.log('Code:', code ? 'present' : 'missing')
  console.log('URL:', requestUrl.toString())

  if (code) {
    // 공통 서버 클라이언트 사용 - 쿠키 도메인 설정 포함
    const supabase = createServerClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Exchange error:', error.message)
      return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }
    
    console.log('Auth success - redirecting to:', next)
    // 성공 시 리다이렉트
    return NextResponse.redirect(new URL(next, requestUrl.origin))
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