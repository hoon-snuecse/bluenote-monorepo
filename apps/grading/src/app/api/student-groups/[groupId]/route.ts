import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, gradeLevel, className, schoolName, schoolYear } = body

    // 권한 확인
    const existingGroup = await prisma.studentGroup.findUnique({
      where: { id: params.groupId }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (existingGroup.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const updatedGroup = await prisma.studentGroup.update({
      where: { id: params.groupId },
      data: {
        name,
        description,
        gradeLevel,
        className,
        schoolName,
        schoolYear
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 권한 확인
    const existingGroup = await prisma.studentGroup.findUnique({
      where: { id: params.groupId }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (existingGroup.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 그룹 삭제 (cascade로 학생들도 함께 삭제됨)
    await prisma.studentGroup.delete({
      where: { id: params.groupId }
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