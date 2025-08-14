import { createServerClient } from '@bluenote/supabase-auth/server';

/**
 * Supabase 기반 인증 체크 헬퍼
 * @param {string|null} requiredRole - 'admin', 'write', or null
 * @returns {Promise<{user?: any, error?: {message: string, status: number}}>}
 */
export async function checkAuth(requiredRole = null) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { error: { message: 'Unauthorized', status: 401 } };
    }
    
    // ADMIN_EMAILS 폴백 (하드코딩된 관리자)
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
    const isAdminEmail = adminEmails.includes(user.email);
    
    // 권한 정보 가져오기 (RLS 실패 가능성 있음)
    let isAdmin = isAdminEmail;
    let canWrite = isAdminEmail;
    let permissions = null;
    
    try {
      const { data: permData } = await supabase
        .from('user_permissions')
        .select('role, can_write, claude_daily_limit')
        .eq('email', user.email)
        .single();
      
      if (permData) {
        permissions = permData;
        isAdmin = permData.role === 'admin' || isAdminEmail;
        canWrite = permData.can_write || isAdmin;
      }
    } catch (dbError) {
      console.log('[checkAuth] Using fallback for:', user.email);
    }
    
    // 권한이 포함된 사용자 객체
    const enrichedUser = {
      ...user,
      isAdmin,
      canWrite,
      permissions
    };
    
    // 권한 체크
    if (requiredRole === 'admin' && !isAdmin) {
      return { error: { message: 'Forbidden - Admin access required', status: 403 } };
    }
    
    if (requiredRole === 'write' && !isAdmin && !canWrite) {
      return { error: { message: 'Forbidden - Write permission required', status: 403 } };
    }
    
    return { user: enrichedUser };
  } catch (error) {
    console.error('[checkAuth] Error:', error);
    return { error: { message: 'Authentication check failed', status: 500 } };
  }
}