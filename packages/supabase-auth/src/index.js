// @bluenote/supabase-auth
// 공통 Supabase 인증 패키지

// 클라이언트 (브라우저/일반)
export { createClient, createBrowserClient } from './client.js'

// 클라이언트 사이드 컴포넌트
export { SupabaseAuthProvider, useSupabaseAuth } from './provider.js'