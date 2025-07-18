// Queue exports
export * from './queue'

// Monitoring exports
export * from './monitoring/sentry'

// Cache exports
export * from './cache'

// Type exports
export * from './types'

// 공통 타입
export interface JobResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

// 환경 변수 검증
export function validateEnvironment() {
  const required = [
    'REDIS_URL',
    'SENTRY_DSN',
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`)
  }
}