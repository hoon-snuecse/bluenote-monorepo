import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/create'

  console.log('=== Quiz app auth callback ===')
  console.log('Code:', code ? 'present' : 'missing')
  console.log('Origin:', requestUrl.origin)

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
      return NextResponse.redirect(new URL('/auth/error?error=' + error.message, requestUrl.origin))
    }
    
    // 성공 시 리다이렉트
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // 코드가 없으면 에러
  return NextResponse.redirect(new URL('/auth/error?error=no_code', requestUrl.origin))
}