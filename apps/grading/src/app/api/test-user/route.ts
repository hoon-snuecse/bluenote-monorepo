import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        session: null
      })
    }
    
    // User 테이블에서 사용자 찾기
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    // StudentGroup에서 createdBy로 검색
    const groupsByEmail = await prisma.studentGroup.findMany({
      where: { createdBy: session.user.email }
    })
    
    return NextResponse.json({
      success: true,
      session: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      },
      dbUser: dbUser,
      groupsCount: groupsByEmail.length,
      message: dbUser ? 'User found in database' : 'User NOT found in database'
    })
  } catch (error) {
    console.error('[Test User] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'User test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name
      }
    }, { status: 500 })
  }
}