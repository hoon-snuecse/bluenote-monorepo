import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { evaluationId: string } }
) {
  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: {
        id: params.evaluationId
      },
      include: {
        submission: {
          select: {
            studentName: true,
            studentId: true,
            content: true,
            submittedAt: true,
            assignmentId: true
          }
        }
      }
    });

    if (!evaluation) {
      return NextResponse.json(
        { success: false, error: '평가 결과를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // JSON 문자열 파싱
    const formattedEvaluation = {
      ...evaluation,
      improvementSuggestions: JSON.parse(evaluation.improvementSuggestions),
      strengths: JSON.parse(evaluation.strengths),
    };

    return NextResponse.json({ 
      success: true, 
      evaluation: formattedEvaluation 
    });
  } catch (error) {
    console.error('평가 결과 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '평가 결과 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 평가 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { evaluationId: string } }
) {
  try {
    const data = await request.json();

    const evaluation = await prisma.evaluation.update({
      where: {
        id: params.evaluationId
      },
      data: {
        domainEvaluations: data.domainEvaluations,
        overallLevel: data.overallLevel,
        overallFeedback: data.overallFeedback,
        improvementSuggestions: JSON.stringify(data.improvementSuggestions || []),
        strengths: JSON.stringify(data.strengths || [])
      }
    });

    // JSON 문자열 파싱
    const formattedEvaluation = {
      ...evaluation,
      improvementSuggestions: JSON.parse(evaluation.improvementSuggestions),
      strengths: JSON.parse(evaluation.strengths),
    };

    return NextResponse.json({ 
      success: true, 
      evaluation: formattedEvaluation 
    });
  } catch (error) {
    console.error('평가 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '평가 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 평가 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { evaluationId: string } }
) {
  try {
    await prisma.evaluation.delete({
      where: {
        id: params.evaluationId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: '평가가 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('평가 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '평가 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}