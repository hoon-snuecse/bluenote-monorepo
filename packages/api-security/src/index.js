/**
 * @bluenote/api-security
 * 
 * Monorepo 전체에서 사용할 수 있는 API 보안 유틸리티
 */

export { requireAuth, requirePermission, withAuth } from './middleware.js'
export { validateRequest, sanitizeInput } from './validators.js'
export { rateLimit, createRateLimiter } from './rate-limit.js'
export { SecurityError, AuthError, PermissionError } from './errors.js'

// 보안 헤더 설정
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

// CORS 설정
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://bluenote.site', 'https://www.bluenote.site']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}