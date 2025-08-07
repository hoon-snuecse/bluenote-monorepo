/**
 * Supabase Auth 클라이언트 설정
 * NextAuth에서 Supabase Auth로 마이그레이션
 */

// 클라이언트 사이드용
export { createClient } from '@bluenote/supabase-auth/client'

// 서버 사이드용
export { 
  createServerClient,
  getSession 
} from '@bluenote/supabase-auth/server'

// Provider 및 Hook
export { 
  SupabaseAuthProvider,
  useSupabaseAuth 
} from '@bluenote/supabase-auth'