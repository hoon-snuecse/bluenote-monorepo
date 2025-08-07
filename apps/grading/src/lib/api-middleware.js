/**
 * API Middleware Wrappers for Grading App
 * Provides easy-to-use wrappers for common security patterns
 */

import { NextResponse } from 'next/server'
import { validateToken } from './api-security'
import { validateRequest, RateLimitError } from '@bluenote/api-security'
import { createRateLimiter } from '@bluenote/api-security/rate-limit'

// Create rate limiters
const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

const apiRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
})

/**
 * Wrap an API handler with authentication
 * @param {Function} handler - The API handler function
 * @returns {Function} Wrapped handler
 */
export function withAuth(handler) {
  return async function(request, context) {
    try {
      // Get token from header
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: '인증이 필요합니다' },
          { status: 401 }
        )
      }

      // Validate token
      const token = authHeader.substring(7)
      const user = await validateToken(token)

      // Add user to request
      request.user = user

      // Call the handler
      return await handler(request, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: error.message || '인증 실패' },
        { status: 401 }
      )
    }
  }
}

/**
 * Wrap an API handler with permission check
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @param {Function} handler - The API handler function
 * @returns {Function} Wrapped handler
 */
export function withPermission(requiredPermissions, handler) {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions]

  return withAuth(async function(request, context) {
    const user = request.user

    // Check if user has any of the required permissions
    const hasPermission = permissions.some(perm => {
      if (perm === 'admin') return user.permissions?.is_admin
      if (perm === 'teacher') return user.permissions?.is_teacher
      if (perm === 'staff') return user.permissions?.is_staff
      return false
    })

    if (!hasPermission) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    return await handler(request, context)
  })
}

/**
 * Wrap an API handler with input validation
 * @param {Object} schema - Zod schema for validation
 * @param {Function} handler - The API handler function
 * @returns {Function} Wrapped handler
 */
export function withValidation(schema, handler) {
  return async function(request, context) {
    try {
      // Parse request body
      const body = await request.json()
      
      // Validate with schema
      const validatedData = validateRequest(schema, body)
      
      // Add validated data to request
      request.validatedData = validatedData
      
      // Call the handler
      return await handler(request, context)
    } catch (error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { 
            error: error.message,
            details: error.errors 
          },
          { status: 400 }
        )
      }
      throw error
    }
  }
}

/**
 * Wrap an API handler with rate limiting
 * @param {Object} options - Rate limit options
 * @param {Function} handler - The API handler function
 * @returns {Function} Wrapped handler
 */
export function withRateLimit(options, handler) {
  const rateLimiter = options ? createRateLimiter(options) : defaultRateLimiter
  
  return async function(request, context) {
    // Mock req/res objects for rate limiter
    const req = {
      ip: request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown'
    }
    
    const res = {
      setHeader: (key, value) => {
        // Headers will be set on the response
      }
    }

    try {
      // Check rate limit
      await new Promise((resolve, reject) => {
        rateLimiter(req, res, (error) => {
          if (error) reject(error)
          else resolve()
        })
      })

      // Call the handler
      const response = await handler(request, context)
      
      // Add rate limit headers to response
      const headers = new Headers(response.headers)
      headers.set('X-RateLimit-Limit', options?.max || 100)
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })
    } catch (error) {
      if (error instanceof RateLimitError || error.status === 429) {
        return NextResponse.json(
          { 
            error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: error.retryAfter 
          },
          { status: 429 }
        )
      }
      throw error
    }
  }
}

/**
 * Compose multiple middleware functions
 * @param {...Function} middlewares - Middleware functions
 * @returns {Function} Composed middleware
 */
export function compose(...middlewares) {
  return function(handler) {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc)
    }, handler)
  }
}

// Export pre-configured middleware combinations
export const requireAuth = withAuth
export const requireAdmin = (handler) => withPermission('admin', handler)
export const requireTeacher = (handler) => withPermission(['admin', 'teacher'], handler)
export const requireStaff = (handler) => withPermission(['admin', 'teacher', 'staff'], handler)