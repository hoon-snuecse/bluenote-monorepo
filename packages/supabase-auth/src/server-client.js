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
    httpOnly: false, // 클라이언트 접근을 위해 false로 설정
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

// 서버 컴포넌트용 클라이언트
export function createServerClient() {
  const cookieStore = cookies()
  
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: getCookieOptions(),
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          const cookieOptions = { ...getCookieOptions(), ...options }
          cookieStore.set({
            name,
            value,
            ...cookieOptions,
          })
        } catch (error) {
          // Server Component에서는 쿠키 설정이 불가능할 수 있음
        }
      },
      remove(name, options) {
        try {
          const cookieOptions = { ...getCookieOptions(), ...options, maxAge: 0 }
          cookieStore.set({
            name,
            value: '',
            ...cookieOptions,
          })
        } catch (error) {
          // Server Component에서는 쿠키 설정이 불가능할 수 있음
        }
      }
    }
  })
}