import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    // 해당 학생의 모든 평가 결과 조회
    const evaluations = await prisma.evaluation.findMany({
      where: {
        studentId: params.studentId
      },
      include: {
        submission: {
          select: {
            studentName: true,
            studentId: true,
            submittedAt: true,
            assignment: {
              select: {
                id: true,
                title: true,
                schoolName: true,
                gradeLevel: true
              }
            }
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
      assignmentId: evaluation.submission.assignment.id,
      assignmentTitle: evaluation.submission.assignment.title,
      schoolName: evaluation.submission.assignment.schoolName,
      gradeLevel: evaluation.submission.assignment.gradeLevel,
      domainEvaluations: evaluation.domainEvaluations,
      overallLevel: evaluation.overallLevel,
      overallFeedback: evaluation.overallFeedback,
      improvementSuggestions: JSON.parse(evaluation.improvementSuggestions),
      strengths: JSON.parse(evaluation.strengths),
      evaluatedAt: evaluation.evaluatedAt,
      evaluatedBy: evaluation.evaluatedBy
    }));
    
    return NextResponse.json({ 
      success: true, 
      evaluations: formattedEvaluations 
    });
  } catch (error) {
    console.error('학생별 평가 결과 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '평가 결과 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}