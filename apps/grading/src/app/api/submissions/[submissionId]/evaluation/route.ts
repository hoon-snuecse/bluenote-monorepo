import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 제출물의 평가 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    console.log('Fetching evaluation for submissionId:', params.submissionId);
    
    // 최신 평가 정보 조회
    const evaluation = await prisma.evaluation.findFirst({
      where: {
        submissionId: params.submissionId,
      },
      orderBy: {
        evaluatedAt: 'desc',
      },
    });

    if (!evaluation) {
      return NextResponse.json(
        { success: false, error: '평가 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('Found evaluation:', evaluation.id);

    // JSON 필드 파싱
    let parsedEvaluation = {
      ...evaluation,
      domainEvaluations: {},
      strengths: [],
      improvementSuggestions: []
    };

    // domainEvaluations 파싱
    if (evaluation.domainEvaluations) {
      try {
        parsedEvaluation.domainEvaluations = typeof evaluation.domainEvaluations === 'string' 
          ? JSON.parse(evaluation.domainEvaluations) 
          : evaluation.domainEvaluations;
      } catch (e) {
        console.error('Error parsing domainEvaluations:', e);
        parsedEvaluation.domainEvaluations = {};
      }
    }

    // strengths 파싱
    if (evaluation.strengths) {
      try {
        parsedEvaluation.strengths = typeof evaluation.strengths === 'string' 
          ? JSON.parse(evaluation.strengths) 
          : evaluation.strengths;
      } catch (e) {
        console.error('Error parsing strengths:', e);
        parsedEvaluation.strengths = [];
      }
    }

    // improvementSuggestions 파싱
    if (evaluation.improvementSuggestions) {
      try {
        parsedEvaluation.improvementSuggestions = typeof evaluation.improvementSuggestions === 'string' 
          ? JSON.parse(evaluation.improvementSuggestions) 
          : evaluation.improvementSuggestions;
      } catch (e) {
        console.error('Error parsing improvementSuggestions:', e);
        parsedEvaluation.improvementSuggestions = [];
      }
    }

    return NextResponse.json({ 
      success: true, 
      evaluation: parsedEvaluation
    });
  } catch (error) {
    console.error('평가 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '평가 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}