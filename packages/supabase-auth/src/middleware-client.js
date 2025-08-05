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

  const supabase = createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
            // 프로덕션에서 서브도메인 간 쿠키 공유
            domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined,
          })
        },
      },
    }
  )

  // 미들웨어에서 사용할 때 response를 반환하기 위해 supabase 객체에 response 첨부
  supabase._response = supabaseResponse
  return supabase
}