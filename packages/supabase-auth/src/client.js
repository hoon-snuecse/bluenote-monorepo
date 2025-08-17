import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

// 환경 변수 확인 - 빌드 시점에 주입되지 않을 경우 대비
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ukxchcyvxnbmsfrsamjk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGNoY3l2eG5ibXNmcnNhbWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTY2NjIsImV4cCI6MjA2NzM5MjY2Mn0.5xnB8uzJu1uxq7S9f7rueKwv0GbiHc4V2uyYgpynvTE'

// 싱글톤 인스턴스
let browserClientInstance = null

// 쿠키 옵션 설정 - 서브도메인 간 공유를 위한 핵심 설정
const getCookieOptions = () => {
  // Vercel 환경에서는 VERCEL_ENV 확인
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.VERCEL_ENV === 'production' ||
                      (typeof window !== 'undefined' && window.location.hostname.includes('bluenote.site'))
  
  return {
    domain: isProduction ? '.bluenote.site' : undefined,
    path: '/',
    sameSite: 'lax',
    secure: isProduction,
    httpOnly: false, // 클라이언트 접근 필요
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

// chunked 쿠키를 합치는 헬퍼 함수
function getCombinedCookie(name) {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split('; ')
  const baseChunk = cookies.find(c => c.startsWith(`${name}=`))
  
  // chunked 쿠키가 있는지 확인 (.0, .1, ...)
  const chunks = []
  let index = 0
  
  while (true) {
    const chunkName = `${name}.${index}`
    const chunk = cookies.find(c => c.startsWith(`${chunkName}=`))
    if (!chunk) break
    chunks.push(chunk.split('=')[1])
    index++
  }
  
  // chunked 쿠키가 있으면 합치고, 없으면 base chunk 반환
  if (chunks.length > 0) {
    return chunks.join('')
  } else if (baseChunk) {
    return baseChunk.split('=')[1]
  }
  
  return null
}

// 브라우저 클라이언트 생성 (쿠키 기반)
export function createBrowserClient() {
  if (!browserClientInstance) {
    console.log('[createBrowserClient] Creating new Supabase client instance');
    
    // @supabase/ssr의 createBrowserClient는 브라우저 환경에서
    // 자동으로 document.cookie를 사용함
    browserClientInstance = createSupabaseBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookieOptions: getCookieOptions(),
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          storageKey: 'sb-ukxchcyvxnbmsfrsamjk-auth-token',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          autoRefreshToken: true
        }
      }
    )
  }
  return browserClientInstance
}

// 기존 createClient를 createBrowserClient로 리다이렉트
export const createClient = createBrowserClient