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

// chunked 쿠키를 합치는 헬퍼 함수
function getCombinedCookie(name) {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split('; ')
  const chunks = []
  let index = 0
  
  while (true) {
    const chunkName = `${name}.${index}`
    const chunk = cookies.find(c => c.startsWith(`${chunkName}=`))
    if (!chunk) break
    chunks.push(chunk.split('=')[1])
    index++
  }
  
  return chunks.length > 0 ? chunks.join('') : null
}

// 브라우저 클라이언트 생성 (쿠키 기반)
export function createBrowserClient() {
  if (!browserClientInstance) {
    browserClientInstance = createSupabaseBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookieOptions: getCookieOptions(),
        cookies: {
          get(name) {
            // chunked 쿠키 처리
            const combined = getCombinedCookie(name)
            if (combined) return decodeURIComponent(combined)
            
            // 일반 쿠키 처리
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return value ? decodeURIComponent(value) : null
          },
          set(name, value, options) {
            const cookieOptions = { ...getCookieOptions(), ...options }
            document.cookie = `${name}=${encodeURIComponent(value)}; path=${cookieOptions.path}; domain=${cookieOptions.domain}; max-age=${cookieOptions.maxAge}; samesite=${cookieOptions.sameSite}${cookieOptions.secure ? '; secure' : ''}`
          },
          remove(name, options) {
            const cookieOptions = { ...getCookieOptions(), ...options }
            // chunked 쿠키 모두 제거
            let index = 0
            while (getCombinedCookie(`${name}.${index}`)) {
              document.cookie = `${name}.${index}=; path=${cookieOptions.path}; domain=${cookieOptions.domain}; max-age=0`
              index++
            }
            // 일반 쿠키 제거
            document.cookie = `${name}=; path=${cookieOptions.path}; domain=${cookieOptions.domain}; max-age=0`
          }
        }
      }
    )
  }
  return browserClientInstance
}

// 기존 createClient를 createBrowserClient로 리다이렉트
export const createClient = createBrowserClient