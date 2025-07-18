import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { StudentReportPDF } from '@/components/pdf/StudentReportPDF'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { evaluationId } = await request.json()

    if (!evaluationId) {
      return NextResponse.json({ error: '평가 ID가 필요합니다.' }, { status: 400 })
    }

    // 평가 데이터 조회
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        student: true,
        assignment: {
          include: {
            rubric: true,
          },
        },
      },
    })

    if (!evaluation) {
      return NextResponse.json({ error: '평가를 찾을 수 없습니다.' }, { status: 404 })
    }

    // PDF 생성
    const doc = React.createElement(StudentReportPDF, {
      evaluation: {
        ...evaluation,
        scores: evaluation.domainScores as any,
        domainEvaluations: evaluation.domainEvaluations as any,
      },
      assignment: evaluation.assignment,
      student: evaluation.student,
    })

    const pdfStream = await pdf(doc).toBuffer()

    // PDF 반환
    return new NextResponse(pdfStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="evaluation_${evaluation.student.name}_${evaluation.assignment.title}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF 생성 오류:', error)
    return NextResponse.json(
      { error: 'PDF 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 여러 평가의 PDF를 한 번에 생성
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId, studentIds } = await request.json()

    if (!assignmentId) {
      return NextResponse.json({ error: '과제 ID가 필요합니다.' }, { status: 400 })
    }

    // 평가 데이터 조회
    const whereClause: any = {
      assignmentId,
    }
    
    if (studentIds && studentIds.length > 0) {
      whereClause.studentId = { in: studentIds }
    }

    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      include: {
        student: true,
        assignment: {
          include: {
            rubric: true,
          },
        },
      },
      orderBy: {
        student: {
          name: 'asc',
        },
      },
    })

    if (evaluations.length === 0) {
      return NextResponse.json({ error: '평가를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 각 평가에 대해 PDF 생성
    const pdfPromises = evaluations.map(async (evaluation) => {
      const doc = React.createElement(StudentReportPDF, {
        evaluation: {
          ...evaluation,
          scores: evaluation.domainScores as any,
          domainEvaluations: evaluation.domainEvaluations as any,
        },
        assignment: evaluation.assignment,
        student: evaluation.student,
      })

      const pdfBuffer = await pdf(doc).toBuffer()
      
      return {
        studentName: evaluation.student.name,
        studentId: evaluation.student.studentId,
        pdfBuffer: pdfBuffer.toString('base64'),
      }
    })

    const pdfs = await Promise.all(pdfPromises)

    return NextResponse.json({
      success: true,
      pdfs,
      count: pdfs.length,
    })
  } catch (error) {
    console.error('PDF 생성 오류:', error)
    return NextResponse.json(
      { error: 'PDF 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}