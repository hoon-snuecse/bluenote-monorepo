import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string; studentId: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 권한 확인
    const group = await prisma.studentGroup.findUnique({
      where: { id: params.groupId },
      select: { createdBy: true }
    })

    if (!group) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (group.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const student = await prisma.student.findFirst({
      where: {
        id: params.studentId,
        groupId: params.groupId
      },
      include: {
        submissions: {
          include: {
            assignment: true,
            evaluations: true
          },
          orderBy: { submittedAt: 'desc' }
        },
        evaluations: {
          include: {
            submission: {
              include: {
                assignment: true
              }
            }
          },
          orderBy: { evaluatedAt: 'desc' }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      student 
    })
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: '학생 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}