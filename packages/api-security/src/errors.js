/**
 * 보안 관련 에러 클래스들
 */

export class SecurityError extends Error {
  constructor(message, code = 'SECURITY_ERROR') {
    super(message)
    this.name = 'SecurityError'
    this.code = code
  }
}

export class AuthError extends SecurityError {
  constructor(message = '인증이 필요합니다') {
    super(message, 'AUTH_ERROR')
    this.name = 'AuthError'
  }
}

export class PermissionError extends SecurityError {
  constructor(message = '권한이 부족합니다') {
    super(message, 'PERMISSION_ERROR')
    this.name = 'PermissionError'
  }
}

export class ValidationError extends SecurityError {
  constructor(message, errors = []) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class RateLimitError extends SecurityError {
  constructor(message = '요청 횟수를 초과했습니다', retryAfter = null) {
    super(message, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}