import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 쿠키 옵션 통합
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.VERCEL_ENV === 'production'
  return {
    domain: isProduction ? '.bluenote.site' : undefined,
    path: '/',
    sameSite: 'lax',
    secure: isProduction,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

// Route Handler용 클라이언트 - 쿠키 설정을 위한 특별 처리
export function createRouteHandlerClient() {
  const cookieStore = cookies()
  
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: getCookieOptions(),
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        const cookieOptions = { ...getCookieOptions(), ...options }
        // Route Handler에서는 직접 쿠키를 설정할 수 없으므로
        // Response 헤더를 통해 설정해야 함
        cookieStore.set({ name, value, ...cookieOptions })
      },
      remove(name, options) {
        const cookieOptions = { ...getCookieOptions(), ...options, maxAge: 0 }
        cookieStore.set({ name, value: '', ...cookieOptions })
      }
    }
  })
}