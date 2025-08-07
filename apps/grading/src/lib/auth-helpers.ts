/**
 * Supabase Auth와 user_permissions 테이블을 연동하는 헬퍼 함수들
 */

import { createAdminClient } from './supabase'

/**
 * 세션과 권한을 함께 가져오는 함수
 * NextAuth의 getServerSession과 유사한 인터페이스 제공
 * 보안을 위해 getUser()를 사용하여 인증 확인
 */
export async function getSessionWithPermissions() {
  const { getUser } = await import('@bluenote/supabase-auth/server')
  const user = await getUser()
  
  if (!user?.email) {
    return null
  }

  // user_permissions 테이블에서 권한 정보 조회
  const supabase = createAdminClient() // Service Role Key 사용
  
  try {
    const { data: permissions, error } = await supabase
      .from('user_permissions')
      .select('role, can_write, claude_daily_limit')
      .eq('user_email', user.email)
      .single()
    
    if (error || !permissions) {
      console.error('Failed to fetch user permissions:', error)
      return null
    }

    // 세션 형식으로 반환
    return {
      user: {
        id: user.id,
        email: user.email,
        permissions: {
          role: permissions.role || 'user',
          can_write: permissions.can_write || false,
          claude_daily_limit: permissions.claude_daily_limit || 3
        }
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (error) {
    console.error('Error in getSessionWithPermissions:', error)
    return null
  }
}

/**
 * 사용자가 특정 권한을 가지고 있는지 체크
 */
export async function checkUserPermission(email: string): Promise<boolean> {
  const supabase = createAdminClient()
  
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('email')
      .eq('email', email)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Error checking user permission:', error)
    return false
  }
}

/**
 * 사용자의 상세 권한 정보 조회
 */
export async function getUserPermissions(email: string) {
  const supabase = createAdminClient()
  
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('role, can_write, claude_daily_limit')
      .eq('email', email)
      .single()
    
    if (error || !data) return null
    
    return {
      role: data.role || 'user',
      can_write: data.can_write || false,
      claude_daily_limit: data.claude_daily_limit || 3
    }
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return null
  }
}

/**
 * 관리자 권한 체크
 */
export async function isAdmin(email: string): Promise<boolean> {
  const permissions = await getUserPermissions(email)
  return permissions?.role === 'admin'
}

/**
 * 쓰기 권한 체크
 */
export async function canWrite(email: string): Promise<boolean> {
  const permissions = await getUserPermissions(email)
  return permissions?.can_write === true
}