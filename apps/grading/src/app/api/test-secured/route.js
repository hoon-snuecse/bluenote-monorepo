/**
 * Test API Route with Security Middleware
 * Demonstrates @bluenote/api-security integration
 */

import { NextResponse } from 'next/server'
import { validateRequest, commonSchemas } from '@bluenote/api-security'
import { z } from 'zod'
import { validateToken } from '@/lib/api-security'

// Request schema for POST
const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
})

/**
 * GET /api/test-secured
 * Protected endpoint - requires authentication
 */
export async function GET(request) {
  try {
    // Check authentication
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

    // Return user info and permissions
    return NextResponse.json({
      success: true,
      message: '인증된 사용자입니다',
      user: {
        id: user.id,
        email: user.email,
        permissions: user.permissions || {}
      }
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: error.message || '인증 실패' },
      { status: 401 }
    )
  }
}

/**
 * POST /api/test-secured
 * Create item - requires authentication and validates input
 */
export async function POST(request) {
  try {
    // Check authentication
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

    // Check permission (example: only teachers and admins can create)
    if (!user.permissions?.is_teacher && !user.permissions?.is_admin) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = validateRequest(createItemSchema, body)

    // Create item (mock implementation)
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      createdBy: user.email,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: '항목이 생성되었습니다',
      data: newItem
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: error.message,
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Handle auth errors
    if (error.name === 'AuthError') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}