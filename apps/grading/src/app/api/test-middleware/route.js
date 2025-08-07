/**
 * Test API Route with Middleware Composition
 * Demonstrates clean API security patterns
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  requireAuth, 
  requireTeacher, 
  withValidation, 
  withRateLimit,
  compose 
} from '@/lib/api-middleware'

// Request schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional()
})

const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().optional()
})

/**
 * GET /api/test-middleware
 * Get user's tasks - requires authentication
 */
export const GET = requireAuth(async (request) => {
  const user = request.user

  // Mock task data
  const tasks = [
    {
      id: '1',
      title: '과제 평가 완료',
      description: '3학년 2반 논설문 평가',
      priority: 'high',
      createdBy: user.email,
      completed: false
    },
    {
      id: '2',
      title: '평가 기준 업데이트',
      description: '새 학기 평가 루브릭 수정',
      priority: 'medium',
      createdBy: user.email,
      completed: true
    }
  ]

  return NextResponse.json({
    success: true,
    data: tasks,
    user: {
      email: user.email,
      permissions: user.permissions
    }
  })
})

/**
 * POST /api/test-middleware
 * Create a task - requires teacher permission and validates input
 */
export const POST = compose(
  withRateLimit({ windowMs: 60000, max: 10 }), // 10 requests per minute
  requireTeacher,
  withValidation(createTaskSchema)
)(async (request) => {
  const user = request.user
  const data = request.validatedData

  // Create task (mock implementation)
  const newTask = {
    id: Math.random().toString(36).substr(2, 9),
    ...data,
    createdBy: user.email,
    createdAt: new Date().toISOString(),
    completed: false
  }

  return NextResponse.json({
    success: true,
    message: '작업이 생성되었습니다',
    data: newTask
  }, { status: 201 })
})

/**
 * PATCH /api/test-middleware
 * Update a task - requires authentication and validates input
 */
export const PATCH = compose(
  requireAuth,
  withValidation(updateTaskSchema)
)(async (request) => {
  const user = request.user
  const data = request.validatedData

  // Update task (mock implementation)
  const updatedTask = {
    id: '1',
    ...data,
    updatedBy: user.email,
    updatedAt: new Date().toISOString()
  }

  return NextResponse.json({
    success: true,
    message: '작업이 업데이트되었습니다',
    data: updatedTask
  })
})

/**
 * DELETE /api/test-middleware
 * Delete a task - requires teacher permission
 */
export const DELETE = requireTeacher(async (request) => {
  const user = request.user
  
  // Get task ID from query params
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('id')
  
  if (!taskId) {
    return NextResponse.json(
      { error: '작업 ID가 필요합니다' },
      { status: 400 }
    )
  }

  // Delete task (mock implementation)
  return NextResponse.json({
    success: true,
    message: `작업 ${taskId}이(가) 삭제되었습니다`,
    deletedBy: user.email,
    deletedAt: new Date().toISOString()
  })
})