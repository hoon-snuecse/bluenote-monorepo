import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { submissionId } = body

    if (!submissionId) {
      return NextResponse.json(
        { error: '제출물 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 제출물 조회
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId }
    })

    if (!submission) {
      return NextResponse.json(
        { error: '제출물을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 매핑되어 있는 경우
    if (submission.studentDbId) {
      return NextResponse.json({
        success: true,
        message: '이미 매핑되어 있습니다.',
        studentDbId: submission.studentDbId
      })
    }

    // 학생 찾기 (학번과 이름으로 매칭)
    const student = await prisma.student.findFirst({
      where: {
        studentId: submission.studentId,
        name: submission.studentName
      }
    })

    if (!student) {
      // 학번만으로 찾기
      const studentByIdOnly = await prisma.student.findFirst({
        where: {
          studentId: submission.studentId
        }
      })

      if (studentByIdOnly) {
        // 학번은 같지만 이름이 다른 경우
        return NextResponse.json({
          success: false,
          error: '학번은 일치하지만 이름이 다릅니다.',
          foundStudent: {
            id: studentByIdOnly.id,
            studentId: studentByIdOnly.studentId,
            name: studentByIdOnly.name
          }
        })
      }

      return NextResponse.json({
        success: false,
        error: '일치하는 학생을 찾을 수 없습니다.'
      })
    }

    // 제출물에 studentDbId 업데이트
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: { studentDbId: student.id }
    })

    // 해당 학생의 모든 제출물도 함께 업데이트 (선택적)
    await prisma.submission.updateMany({
      where: {
        studentId: submission.studentId,
        studentName: submission.studentName,
        studentDbId: null
      },
      data: {
        studentDbId: student.id
      }
    })

    return NextResponse.json({
      success: true,
      message: '학생 매핑이 완료되었습니다.',
      studentDbId: student.id,
      student: student
    })
  } catch (error) {
    console.error('Error mapping student:', error)
    return NextResponse.json(
      { error: '학생 매핑 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 일괄 매핑
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 매핑되지 않은 모든 제출물 조회
    const unmappedSubmissions = await prisma.submission.findMany({
      where: {
        studentDbId: null
      }
    })

    let mappedCount = 0
    let failedCount = 0
    const failures = []

    for (const submission of unmappedSubmissions) {
      const student = await prisma.student.findFirst({
        where: {
          studentId: submission.studentId,
          name: submission.studentName
        }
      })

      if (student) {
        await prisma.submission.update({
          where: { id: submission.id },
          data: { studentDbId: student.id }
        })
        mappedCount++
      } else {
        failedCount++
        failures.push({
          submissionId: submission.id,
          studentId: submission.studentId,
          studentName: submission.studentName
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `일괄 매핑이 완료되었습니다.`,
      results: {
        total: unmappedSubmissions.length,
        mapped: mappedCount,
        failed: failedCount,
        failures: failures
      }
    })
  } catch (error) {
    console.error('Error in batch mapping:', error)
    return NextResponse.json(
      { error: '일괄 매핑 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}