/**
 * 입력 검증 및 사니타이징 유틸리티
 */

import { z } from 'zod'
import { ValidationError } from './errors.js'

/**
 * 요청 데이터 검증
 * @param {Object} schema - Zod 스키마
 * @param {Object} data - 검증할 데이터
 * @returns {Object} 검증된 데이터
 */
export function validateRequest(schema, data) {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        '입력 데이터가 유효하지 않습니다',
        error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      )
    }
    throw error
  }
}

/**
 * HTML/Script 태그 제거
 * @param {string} input - 사니타이징할 문자열
 * @returns {string} 사니타이징된 문자열
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  // HTML 태그 제거
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Script 태그 및 이벤트 핸들러 제거
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '')
  
  // XSS 공격 패턴 제거
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/vbscript:/gi, '')
  
  return sanitized.trim()
}

/**
 * 이메일 주소 검증
 * @param {string} email - 검증할 이메일
 * @returns {boolean} 유효 여부
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * URL 검증
 * @param {string} url - 검증할 URL
 * @returns {boolean} 유효 여부
 */
export function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 공통 검증 스키마
 */
export const commonSchemas = {
  // 이메일 스키마
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  
  // 페이지네이션 스키마
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),
  
  // ID 스키마 (UUID)
  id: z.string().uuid('올바른 ID 형식이 아닙니다'),
  
  // 날짜 스키마
  date: z.string().datetime('올바른 날짜 형식이 아닙니다')
}