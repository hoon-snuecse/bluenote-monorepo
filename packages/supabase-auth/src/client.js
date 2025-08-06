import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 싱글톤 인스턴스
let clientInstance = null
let browserClientInstance = null

// 기본 클라이언트 생성 (서버/클라이언트 공통)
export function createClient() {
  if (!clientInstance) {
    clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  }
  return clientInstance
}

// 클라이언트 컴포넌트용 브라우저 클라이언트
export function createBrowserClient() {
  if (!browserClientInstance) {
    browserClientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'implicit'  // Implicit flow 사용 (Site URL 문제 회피)
      }
    })
  }
  return browserClientInstance
}