import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// 미들웨어용 Supabase 클라이언트
export function createServerClient(request, response) {
  return createMiddlewareClient({ request, response })
}