// 클라이언트용 export
export { 
  createClient, 
  createBrowserClient
} from '@bluenote/supabase-auth'

// 서버용은 '@bluenote/supabase-auth/server'에서 import
// createServerClient는 서버 컴포넌트에서만 사용