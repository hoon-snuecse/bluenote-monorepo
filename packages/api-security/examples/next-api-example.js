/**
 * Next.js API Route 예제
 */

import { requireAuth, validateRequest, rateLimit } from '@bluenote/api-security'
import { z } from 'zod'

// 요청 스키마 정의
const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive()
})

// API 핸들러
const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 요청 데이터 검증
    const data = validateRequest(createItemSchema, req.body)
    
    // 비즈니스 로직
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdBy: req.user.email,
      createdAt: new Date().toISOString()
    }
    
    // 응답
    res.status(201).json({ 
      success: true, 
      data: newItem 
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: error.message,
        details: error.errors 
      })
    }
    throw error
  }
}

// 미들웨어 체인
export default rateLimit(requireAuth(handler))