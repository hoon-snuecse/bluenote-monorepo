import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 싱글톤 인스턴스
let browserClientInstance = null

// 쿠키 옵션 설정 - 서브도메인 간 공유를 위한 핵심 설정
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    domain: isProduction ? '.bluenote.site' : undefined,
    path: '/',
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

// 브라우저 클라이언트 생성 (쿠키 기반)
export function createBrowserClient() {
  if (!browserClientInstance) {
    browserClientInstance = createSupabaseBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookieOptions: getCookieOptions(),
        // 쿠키 기반 storage adapter
        cookies: {
          get(name) {
            if (typeof document === 'undefined') return ''
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return decodeURIComponent(value || '')
          },
          set(name, value, options) {
            if (typeof document === 'undefined') return
            const cookieOptions = { ...getCookieOptions(), ...options }
            const cookieStr = Object.entries(cookieOptions)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => {
                if (k === 'maxAge') return `max-age=${v}`
                if (k === 'secure' && v) return 'secure'
                if (k === 'sameSite') return `samesite=${v}`
                if (k === 'domain') return `domain=${v}`
                if (k === 'path') return `path=${v}`
                return ''
              })
              .filter(Boolean)
              .join('; ')
            document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieStr}`
          },
          remove(name, options) {
            if (typeof document === 'undefined') return
            const cookieOptions = { ...getCookieOptions(), ...options, maxAge: 0 }
            this.set(name, '', cookieOptions)
          }
        }
      }
    )
  }
  return browserClientInstance
}

// 기존 createClient를 createBrowserClient로 리다이렉트
export const createClient = createBrowserClient