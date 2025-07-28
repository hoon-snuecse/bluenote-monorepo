import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 브라우저 클라이언트
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// 서버 클라이언트 (Service Role)
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// RLS 컨텍스트 설정 헬퍼
export async function setRLSContext(supabase, email) {
  const { data, error } = await supabase.rpc('set_current_user_email', { 
    email: email 
  })
  
  if (error) {
    console.error('RLS 컨텍스트 설정 실패:', error)
    throw error
  }
  
  return data
}