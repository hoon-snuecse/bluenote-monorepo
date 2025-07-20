import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 그룹 권한 확인
    const group = await prisma.studentGroup.findUnique({
      where: { id: params.groupId },
      include: {
        students: {
          orderBy: [
            { studentId: 'asc' },
            { name: 'asc' }
          ]
        }
      }
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

    return NextResponse.json({ 
      success: true, 
      students: group.students
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: '학생 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 그룹 권한 확인
    const group = await prisma.studentGroup.findUnique({
      where: { id: params.groupId }
    })

    if (!group) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (group.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { students } = body

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: '학생 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 중복 학번 체크
    const existingStudents = await prisma.student.findMany({
      where: {
        groupId: params.groupId,
        studentId: {
          in: students.map(s => s.studentId)
        }
      }
    })

    if (existingStudents.length > 0) {
      return NextResponse.json(
        { 
          error: '이미 등록된 학번이 있습니다.',
          duplicates: existingStudents.map(s => s.studentId)
        },
        { status: 400 }
      )
    }

    // 학생들 추가
    const result = await prisma.student.createMany({
      data: students.map((student: any) => ({
        studentId: student.studentId,
        name: student.name,
        email: student.email || null,
        groupId: params.groupId
      }))
    })

    return NextResponse.json({ 
      success: true,
      count: result.count,
      message: `${result.count}명의 학생이 추가되었습니다.`
    })
  } catch (error) {
    console.error('Error adding students:', error)
    return NextResponse.json(
      { error: '학생 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

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
    const { studentId, updates } = body

    if (!studentId || !updates) {
      return NextResponse.json(
        { error: '학생 ID와 수정 데이터가 필요합니다.' },
        { status: 400 }
      )
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
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 학생 확인
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        groupId: params.groupId
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 학번 변경 시 중복 체크
    if (updates.studentId && updates.studentId !== existingStudent.studentId) {
      const duplicate = await prisma.student.findFirst({
        where: {
          studentId: updates.studentId,
          groupId: params.groupId,
          id: { not: studentId }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: '해당 학번이 이미 존재합니다.' },
          { status: 400 }
        )
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        studentId: updates.studentId || existingStudent.studentId,
        name: updates.name || existingStudent.name,
        email: updates.email !== undefined ? updates.email : existingStudent.email
      }
    })

    return NextResponse.json({ 
      success: true, 
      student: updatedStudent 
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: '학생 정보 수정 중 오류가 발생했습니다.' },
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

    const { searchParams } = new URL(request.url)
    const studentIds = searchParams.get('studentIds')?.split(',')

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json(
        { error: '삭제할 학생을 선택해주세요.' },
        { status: 400 }
      )
    }

    // 그룹 권한 확인
    const group = await prisma.studentGroup.findUnique({
      where: { id: params.groupId }
    })

    if (!group) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (group.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 학생들 삭제
    const result = await prisma.student.deleteMany({
      where: {
        groupId: params.groupId,
        id: {
          in: studentIds
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      count: result.count,
      message: `${result.count}명의 학생이 삭제되었습니다.`
    })
  } catch (error) {
    console.error('Error deleting students:', error)
    return NextResponse.json(
      { error: '학생 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}