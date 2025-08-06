import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 미들웨어용 Supabase 클라이언트
export function createServerClient(request, response) {
  // 쿠키 처리를 위한 객체 생성 - response가 없으면 생성
  const supabaseResponse = response || NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  const supabase = createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: getCookieOptions(),
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          const cookieOptions = { ...getCookieOptions(), ...options }
          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...cookieOptions,
          })
        },
        remove(name, options) {
          const cookieOptions = { ...getCookieOptions(), ...options, maxAge: 0 }
          request.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          })
        },
      },
    }
  )

  // 미들웨어에서 사용할 때 response를 반환하기 위해 supabase 객체에 response 첨부
  supabase._response = supabaseResponse
  return supabase
}