import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Create Sample Group] Creating for user:', session.user.email)

    // 샘플 그룹 생성
    const group = await prisma.studentGroup.create({
      data: {
        name: '3학년 1반',
        description: '2024학년도 3학년 1반 학생 그룹',
        schoolName: '한국초등학교',
        gradeLevel: '3학년',
        className: '1반',
        schoolYear: '2024',
        createdBy: session.user.email
      }
    })

    // 샘플 학생들 생성
    const students = [
      { studentId: '20240301', name: '김민준', email: 'minjun.kim@example.com' },
      { studentId: '20240302', name: '이서연', email: 'seoyeon.lee@example.com' },
      { studentId: '20240303', name: '박지호', email: 'jiho.park@example.com' },
      { studentId: '20240304', name: '최유진', email: 'yujin.choi@example.com' },
      { studentId: '20240305', name: '정하늘', email: 'haneul.jung@example.com' }
    ]

    await prisma.student.createMany({
      data: students.map(student => ({
        ...student,
        groupId: group.id
      }))
    })

    // 생성된 그룹을 학생 수와 함께 반환
    const createdGroup = await prisma.studentGroup.findUnique({
      where: { id: group.id },
      include: {
        _count: {
          select: { students: true }
        },
        students: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '샘플 그룹이 생성되었습니다',
      group: {
        ...createdGroup,
        studentCount: createdGroup?._count.students || 0
      }
    })
  } catch (error) {
    console.error('[Create Sample Group] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create sample group',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name
      }
    }, { status: 500 })
  }
}