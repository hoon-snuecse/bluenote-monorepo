import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // 인증 상태 확인
    const authInfo = {
      isAuthenticated: !!session?.user?.email,
      userEmail: session?.user?.email || 'Not authenticated',
      userName: session?.user?.name || 'Unknown'
    }
    
    // 데이터베이스 상태 확인
    let dbInfo = {
      connected: false,
      tables: {
        StudentGroup: false,
        Student: false,
        User: false
      },
      counts: {
        StudentGroup: 0,
        Student: 0,
        User: 0
      }
    }
    
    try {
      // 연결 테스트
      await prisma.$queryRaw`SELECT 1`
      dbInfo.connected = true
      
      // 테이블 존재 확인 및 카운트
      try {
        dbInfo.counts.StudentGroup = await prisma.studentGroup.count()
        dbInfo.tables.StudentGroup = true
      } catch (e) {}
      
      try {
        dbInfo.counts.Student = await prisma.student.count()
        dbInfo.tables.Student = true
      } catch (e) {}
      
      try {
        dbInfo.counts.User = await prisma.user.count()
        dbInfo.tables.User = true
      } catch (e) {}
    } catch (error) {
      console.error('[Debug Info] Database error:', error)
    }
    
    // 사용자의 그룹 확인
    let userGroups = []
    if (session?.user?.email && dbInfo.tables.StudentGroup) {
      try {
        userGroups = await prisma.studentGroup.findMany({
          where: { createdBy: session.user.email },
          select: { 
            id: true, 
            name: true, 
            schoolName: true,
            _count: { select: { students: true } }
          }
        })
      } catch (e) {}
    }
    
    return NextResponse.json({
      success: true,
      auth: authInfo,
      database: dbInfo,
      userGroups: {
        count: userGroups.length,
        groups: userGroups
      },
      timestamp: new Date().toISOString(),
      message: '디버그 정보가 수집되었습니다'
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('[Debug Info] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: '디버그 정보 수집 실패',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name
      }
    }, { status: 500 })
  }
}