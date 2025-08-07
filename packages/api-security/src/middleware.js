/**
 * 인증 미들웨어
 */

import { AuthError, PermissionError } from './errors.js'

/**
 * API 라우트에 인증을 요구하는 미들웨어
 * @param {Function} handler - API 핸들러 함수
 * @returns {Function} 래핑된 핸들러
 */
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      // Supabase Auth 체크
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthError('인증이 필요합니다')
      }

      // 토큰 검증 로직은 각 앱에서 구현
      // 여기서는 기본 구조만 제공
      req.user = await validateToken(authHeader.substring(7))
      
      return handler(req, res)
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(401).json({ error: error.message })
      }
      throw error
    }
  }
}

/**
 * 특정 권한을 요구하는 미들웨어
 * @param {string|string[]} permissions - 필요한 권한
 * @returns {Function} 미들웨어 함수
 */
export function requirePermission(permissions) {
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions]
  
  return function(handler) {
    return async (req, res) => {
      try {
        // 먼저 인증 체크
        if (!req.user) {
          throw new AuthError('인증이 필요합니다')
        }

        // 권한 체크
        const hasPermission = requiredPermissions.some(permission => 
          req.user.permissions?.includes(permission)
        )

        if (!hasPermission) {
          throw new PermissionError('권한이 부족합니다')
        }

        return handler(req, res)
      } catch (error) {
        if (error instanceof PermissionError) {
          return res.status(403).json({ error: error.message })
        }
        if (error instanceof AuthError) {
          return res.status(401).json({ error: error.message })
        }
        throw error
      }
    }
  }
}

/**
 * 인증 정보를 추가하는 미들웨어 (선택적 인증)
 * @param {Function} handler - API 핸들러 함수
 * @returns {Function} 래핑된 핸들러
 */
export function withAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          req.user = await validateToken(authHeader.substring(7))
        } catch {
          // 인증 실패 시 무시 (선택적 인증)
          req.user = null
        }
      } else {
        req.user = null
      }
      
      return handler(req, res)
    } catch (error) {
      throw error
    }
  }
}

/**
 * 토큰 검증 함수 (각 앱에서 구현 필요)
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} 사용자 정보
 */
async function validateToken(token) {
  // 이 함수는 각 앱에서 Supabase 클라이언트를 사용하여 구현
  // 예: const { data: { user } } = await supabase.auth.getUser(token)
  throw new Error('validateToken must be implemented by the app')
}