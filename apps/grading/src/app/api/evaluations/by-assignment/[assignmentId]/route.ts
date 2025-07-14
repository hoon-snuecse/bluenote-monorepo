import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // Use select instead of include for better performance
    const evaluations = await prisma.evaluation.findMany({
      where: {
        assignmentId: params.assignmentId
      },
      select: {
        id: true,
        submissionId: true,
        assignmentId: true,
        studentId: true,
        domainEvaluations: true,
        overallLevel: true,
        overallFeedback: true,
        improvementSuggestions: true,
        strengths: true,
        evaluatedAt: true,
        evaluatedBy: true,
        submission: {
          select: {
            studentName: true,
            studentId: true,
            submittedAt: true
          }
        }
      },
      orderBy: {
        evaluatedAt: 'desc'
      }
    });

    // JSON 문자열 파싱 및 형식 정리
    const formattedEvaluations = evaluations.map(evaluation => ({
      id: evaluation.id,
      submissionId: evaluation.submissionId,
      studentName: evaluation.submission.studentName,
      studentId: evaluation.submission.studentId,
      submittedAt: evaluation.submission.submittedAt,
      domainEvaluations: evaluation.domainEvaluations,
      overallLevel: evaluation.overallLevel,
      overallFeedback: evaluation.overallFeedback,
      improvementSuggestions: JSON.parse(evaluation.improvementSuggestions),
      evaluatedAt: evaluation.evaluatedAt
    }));

    return NextResponse.json({ 
      success: true, 
      evaluations: formattedEvaluations 
    });
  } catch (error) {
    console.error('평가 결과 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '평가 결과 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}