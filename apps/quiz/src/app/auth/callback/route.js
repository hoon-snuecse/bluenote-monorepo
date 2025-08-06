import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/create'

  console.log('=== Quiz app auth callback route ===')
  console.log('Code:', code ? 'present' : 'missing')

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Exchange error:', error.message)
      return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }
    
    // 성공 시 리다이렉트
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // code가 없으면 클라이언트 페이지로 (Implicit flow 처리용)
  return NextResponse.next()
}