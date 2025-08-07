/**
 * API Security integration for Grading app
 * Provides token validation using Supabase Auth
 */

import { createClient } from '@bluenote/supabase-auth'
import { AuthError } from '@bluenote/api-security'

/**
 * Validate JWT token with Supabase Auth
 * @param {string} token - JWT token to validate
 * @returns {Promise<Object>} User object
 */
export async function validateToken(token) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new AuthError('유효하지 않은 토큰입니다')
  }
  
  // Get user permissions from database
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('email', user.email)
    .single()
  
  // Add permissions to user object
  if (permissions) {
    user.permissions = {
      is_admin: permissions.is_admin || false,
      is_teacher: permissions.is_teacher || false,
      is_staff: permissions.is_staff || false,
      created_at: permissions.created_at,
      updated_at: permissions.updated_at
    }
  }
  
  return user
}

/**
 * Get current user from request headers
 * Used for API routes
 */
export async function getCurrentUser(req) {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  try {
    const token = authHeader.substring(7)
    return await validateToken(token)
  } catch (error) {
    return null
  }
}