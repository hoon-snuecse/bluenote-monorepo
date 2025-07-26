import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // CORS 헤더 설정
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 모든 평가 가져오기 (evaluatedByUser가 있는 것만)
    const evaluations = await prisma.evaluation.findMany({
      select: {
        evaluatedBy: true,
        evaluatedByUser: true
      },
      where: {
        evaluatedByUser: {
          not: null
        }
      }
    });

    // 사용자별 모델별 채점 횟수 집계
    const userStats: Record<string, { sonnet: number; opus: number }> = {};

    evaluations.forEach(evaluation => {
      const userEmail = evaluation.evaluatedByUser!;
      const model = (evaluation.evaluatedBy || '').toLowerCase();

      if (!userStats[userEmail]) {
        userStats[userEmail] = { sonnet: 0, opus: 0 };
      }

      if (model.includes('sonnet')) {
        userStats[userEmail].sonnet++;
      } else if (model.includes('opus')) {
        userStats[userEmail].opus++;
      }
    });

    return NextResponse.json({
      userStats,
      totalEvaluations: evaluations.length
    }, { headers });
  } catch (error) {
    console.error('사용자별 평가 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자별 평가 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}