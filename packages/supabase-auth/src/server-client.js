import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 서버 컴포넌트용 클라이언트
export function createServerClient() {
  const cookieStore = cookies()
  
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
            // 프로덕션에서는 서브도메인 간 쿠키 공유를 위해 도메인 설정
            domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          })
        } catch (error) {
          // Server Component에서는 쿠키 설정이 불가능할 수 있음
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined
          })
        } catch (error) {
          // Server Component에서는 쿠키 설정이 불가능할 수 있음
        }
      }
    }
  })
}