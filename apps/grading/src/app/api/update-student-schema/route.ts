import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('[Update Student Schema] Starting schema update')
    
    // Student 테이블에 새 컬럼 추가
    await prisma.$executeRaw`
      ALTER TABLE "Student" 
      ADD COLUMN IF NOT EXISTS "grade" TEXT,
      ADD COLUMN IF NOT EXISTS "class" TEXT,
      ADD COLUMN IF NOT EXISTS "number" INTEGER
    `
    
    // 인덱스 추가
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Student_grade_idx" ON "Student"("grade")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Student_class_idx" ON "Student"("class")`
    
    return NextResponse.json({
      success: true,
      message: 'Student 스키마가 업데이트되었습니다'
    })
  } catch (error) {
    console.error('[Update Student Schema] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update schema',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name
      }
    }, { status: 500 })
  }
}