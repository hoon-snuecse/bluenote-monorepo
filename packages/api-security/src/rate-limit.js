/**
 * Rate Limiting 유틸리티
 */

import { RateLimitError } from './errors.js'

// 메모리 기반 스토어 (실제 프로덕션에서는 Redis 사용 권장)
const store = new Map()

/**
 * Rate Limiter 생성
 * @param {Object} options - Rate limit 옵션
 * @param {number} options.windowMs - 시간 윈도우 (ms)
 * @param {number} options.max - 최대 요청 수
 * @param {string} options.message - 에러 메시지
 * @param {Function} options.keyGenerator - 키 생성 함수
 * @returns {Function} 미들웨어 함수
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15분
    max = 100, // 최대 100개 요청
    message = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    keyGenerator = (req) => req.ip || 'anonymous'
  } = options

  return async function rateLimitMiddleware(req, res, next) {
    const key = keyGenerator(req)
    const now = Date.now()
    
    // 현재 키의 요청 기록 가져오기
    let record = store.get(key)
    
    if (!record) {
      // 새로운 기록 생성
      record = {
        count: 1,
        resetTime: now + windowMs
      }
      store.set(key, record)
    } else if (now > record.resetTime) {
      // 시간 윈도우가 지났으면 리셋
      record.count = 1
      record.resetTime = now + windowMs
    } else {
      // 카운트 증가
      record.count++
    }
    
    // Rate limit 헤더 설정
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count))
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
    
    // 제한 초과 체크
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      res.setHeader('Retry-After', retryAfter)
      
      if (res.status && res.json) {
        // Next.js API Route
        return res.status(429).json({
          error: message,
          retryAfter
        })
      } else {
        // Express style
        throw new RateLimitError(message, retryAfter)
      }
    }
    
    // 다음 미들웨어로
    if (next) {
      next()
    }
  }
}

/**
 * 기본 Rate Limiter
 */
export const rateLimit = createRateLimiter()

/**
 * API 엔드포인트별 Rate Limiter
 */
export const apiRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1분
  max: 30, // 최대 30개 요청
  message: 'API 요청 한도를 초과했습니다.'
})

/**
 * 인증 시도 Rate Limiter
 */
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5번 시도
  message: '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.'
})

/**
 * 메모리 스토어 정리 (메모리 누수 방지)
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key)
    }
  }
}, 60 * 1000) // 1분마다 정리