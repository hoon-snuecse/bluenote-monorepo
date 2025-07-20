import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('[Test DB] Starting test')
    
    // 1. Prisma 연결 테스트
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('[Test DB] Raw query success:', dbTest)
    
    // 2. StudentGroup 테이블 존재 확인
    const groupCount = await prisma.studentGroup.count()
    console.log('[Test DB] StudentGroup count:', groupCount)
    
    // 3. 첫 번째 그룹 조회 테스트
    const firstGroup = await prisma.studentGroup.findFirst()
    console.log('[Test DB] First group:', firstGroup?.id)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      results: {
        rawQuery: 'OK',
        groupCount: groupCount,
        firstGroupId: firstGroup?.id || 'No groups found'
      }
    })
  } catch (error) {
    console.error('[Test DB] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name,
        code: (error as any)?.code
      }
    }, { status: 500 })
  }
}