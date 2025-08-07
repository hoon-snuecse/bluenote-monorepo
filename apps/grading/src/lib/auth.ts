/**
 * Legacy auth.ts - 호환성을 위해 유지
 * 새로운 코드는 auth-helpers.ts를 사용하세요
 */

import { getSessionWithPermissions, checkUserPermission, getUserPermissions } from './auth-helpers'

// NextAuth 호환성을 위한 레거시 익스포트
// 점진적 마이그레이션을 위해 임시로 유지
export async function getServerSession(authOptions?: any) {
  // authOptions 파라미터는 무시하고 Supabase 세션 반환
  const session = await getSessionWithPermissions()
  
  if (!session) return null
  
  // NextAuth 세션 형식으로 변환
  return {
    user: {
      id: session.user.id || session.user.email,
      email: session.user.email,
      name: session.user.email?.split('@')[0],
      role: session.user.permissions?.role || 'user',
      isAdmin: session.user.permissions?.role === 'admin',
      canWrite: session.user.permissions?.can_write || false,
      claudeDailyLimit: session.user.permissions?.claude_daily_limit || 3
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
}

export const getSession = getServerSession

// Supabase 기반 권한 체크 함수들 (레거시 호환성)
export const authCallbacks = {
  checkUserPermission,
  getUserPermissions
}

// NextAuth authOptions 대체 (더 이상 사용하지 않음)
export const authOptions = {}