import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { StudentReportPDF } from '@/components/pdf/StudentReportPDF'
import { registerKoreanFonts } from '@/lib/pdf-font-setup'

// JSON 필드 안전하게 파싱
function parseJSON(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
}

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

    // 한글 폰트 등록
    registerKoreanFonts();

    // 평가 데이터 조회
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        submission: true,
      },
    })

    if (!evaluation) {
      return NextResponse.json({ error: '평가를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 과제 데이터 조회
    const assignment = await prisma.assignment.findUnique({
      where: { id: evaluation.submission.assignmentId },
    })

    if (!assignment) {
      return NextResponse.json({ error: '과제를 찾을 수 없습니다.' }, { status: 404 })
    }

    // JSON 필드 파싱
    const domainEvaluations = parseJSON(evaluation.domainEvaluations);
    const improvementSuggestions = parseJSON(evaluation.improvementSuggestions);
    const strengths = parseJSON(evaluation.strengths);

    // PDF 생성
    const doc = React.createElement(StudentReportPDF, {
      evaluation: {
        ...evaluation,
        domainEvaluations,
        improvementSuggestions: Array.isArray(improvementSuggestions)
          ? improvementSuggestions
          : [improvementSuggestions],
        strengths: Array.isArray(strengths)
          ? strengths
          : [strengths],
      },
      assignment: {
        ...assignment,
        evaluationDomains: parseJSON(assignment.evaluationDomains),
        evaluationLevels: parseJSON(assignment.evaluationLevels),
      },
      student: {
        name: evaluation.submission.studentName,
        studentId: evaluation.submission.studentId,
      },
      submission: evaluation.submission,
      studentPageStart: 1, // 개별 보고서는 1페이지부터 시작
    })

    const pdfBuffer = await pdf(doc).toBlob()

    // PDF 반환
    const fileName = `${evaluation.submission.studentName}_${assignment.title}_평가보고서.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
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