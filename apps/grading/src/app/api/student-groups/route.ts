import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('[StudentGroups API] Starting GET request')
    
    const session = await getServerSession(authOptions)
    console.log('[StudentGroups API] Session:', JSON.stringify(session))
    
    if (!session || !session.user) {
      console.log('[StudentGroups API] No session or user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Use email as identifier if id is not available
    const userId = session.user.id || session.user.email
    if (!userId) {
      console.log('[StudentGroups API] No user identifier found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const schoolYear = searchParams.get('schoolYear')
    const gradeLevel = searchParams.get('gradeLevel')
    const className = searchParams.get('className')

    const whereClause: any = {
      createdBy: userId
    }

    if (schoolYear) whereClause.schoolYear = schoolYear
    if (gradeLevel) whereClause.gradeLevel = gradeLevel
    if (className) whereClause.className = className

    console.log('[StudentGroups API] Where clause:', whereClause)

    try {
      const groups = await prisma.studentGroup.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { students: true }
          }
        },
        orderBy: [
          { schoolYear: 'desc' },
          { gradeLevel: 'asc' },
          { className: 'asc' }
        ]
      })

      console.log('[StudentGroups API] Found groups:', groups.length)

      return NextResponse.json({ 
        success: true, 
        groups: groups.map(group => ({
          ...group,
          studentCount: group._count.students
        }))
      })
    } catch (dbError) {
      console.error('[StudentGroups API] Database error:', dbError)
      throw dbError
    }
  } catch (error) {
    console.error('[StudentGroups API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch student groups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      console.log('[StudentGroups API POST] No session or user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id || session.user.email
    if (!userId) {
      console.log('[StudentGroups API POST] No user identifier found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      description,
      schoolName,
      gradeLevel,
      className,
      schoolYear,
      students
    } = body

    if (!name || !schoolName || !schoolYear) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 그룹과 학생들을 함께 생성
    const result = await prisma.$transaction(async (tx) => {
      // 그룹 생성
      const group = await tx.studentGroup.create({
        data: {
          name,
          description,
          schoolName,
          gradeLevel,
          className,
          schoolYear,
          createdBy: userId
        }
      })

      // 학생들이 제공된 경우 학생들도 생성
      if (students && students.length > 0) {
        await tx.student.createMany({
          data: students.map((student: any) => ({
            studentId: student.studentId,
            name: student.name,
            email: student.email,
            groupId: group.id
          }))
        })
      }

      // 생성된 그룹을 학생 수와 함께 반환
      return await tx.studentGroup.findUnique({
        where: { id: group.id },
        include: {
          _count: {
            select: { students: true }
          }
        }
      })
    })

    return NextResponse.json({ 
      success: true, 
      group: {
        ...result,
        studentCount: result?._count.students || 0
      }
    })
  } catch (error) {
    console.error('Error creating student group:', error)
    return NextResponse.json(
      { error: '학생 그룹 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      console.log('[StudentGroups API POST] No session or user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id || session.user.email
    if (!userId) {
      console.log('[StudentGroups API POST] No user identifier found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, gradeLevel, className } = body

    if (!id) {
      return NextResponse.json(
        { error: '그룹 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 권한 확인
    const existingGroup = await prisma.studentGroup.findUnique({
      where: { id }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (existingGroup.createdBy !== userId) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const updatedGroup = await prisma.studentGroup.update({
      where: { id },
      data: {
        name,
        description,
        gradeLevel,
        className
      },
      include: {
        _count: {
          select: { students: true }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      group: {
        ...updatedGroup,
        studentCount: updatedGroup._count.students
      }
    })
  } catch (error) {
    console.error('Error updating student group:', error)
    return NextResponse.json(
      { error: '학생 그룹 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      console.log('[StudentGroups API POST] No session or user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id || session.user.email
    if (!userId) {
      console.log('[StudentGroups API POST] No user identifier found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '그룹 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 권한 확인
    const existingGroup = await prisma.studentGroup.findUnique({
      where: { id }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (existingGroup.createdBy !== userId) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 그룹 삭제 (cascade로 학생들도 함께 삭제됨)
    await prisma.studentGroup.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: '학생 그룹이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Error deleting student group:', error)
    return NextResponse.json(
      { error: '학생 그룹 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}