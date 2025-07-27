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

    // 날짜별 사용자별 평가 통계 가져오기
    const evaluations = await prisma.evaluation.findMany({
      select: {
        evaluatedBy: true,
        evaluatedByUser: true,
        evaluatedAt: true
      },
      where: {
        evaluatedByUser: {
          not: null
        }
      },
      orderBy: {
        evaluatedAt: 'desc'
      }
    });

    // 날짜별 사용자별 모델별 채점 횟수 집계
    type DailyUserStats = Record<string, { 
      sonnet: number; 
      opus: number; 
      total: number;
      lastEvaluatedAt: string;
    }>;
    
    const dailyStats: Record<string, DailyUserStats> = {};

    evaluations.forEach(evaluation => {
      const userEmail = evaluation.evaluatedByUser!;
      const model = (evaluation.evaluatedBy || '').toLowerCase();
      const date = evaluation.evaluatedAt.toISOString().split('T')[0]; // YYYY-MM-DD 형식

      if (!dailyStats[date]) {
        dailyStats[date] = {};
      }

      if (!dailyStats[date][userEmail]) {
        dailyStats[date][userEmail] = { 
          sonnet: 0, 
          opus: 0, 
          total: 0,
          lastEvaluatedAt: evaluation.evaluatedAt.toISOString()
        };
      }

      dailyStats[date][userEmail].total++;

      if (model.includes('sonnet')) {
        dailyStats[date][userEmail].sonnet++;
      } else if (model.includes('opus')) {
        dailyStats[date][userEmail].opus++;
      }

      // 최신 평가 시간 업데이트
      if (evaluation.evaluatedAt.toISOString() > dailyStats[date][userEmail].lastEvaluatedAt) {
        dailyStats[date][userEmail].lastEvaluatedAt = evaluation.evaluatedAt.toISOString();
      }
    });

    // 전체 사용자별 통계도 계산
    const userTotals: Record<string, { sonnet: number; opus: number; total: number }> = {};
    
    Object.values(dailyStats).forEach(dayData => {
      Object.entries(dayData).forEach(([email, stats]) => {
        if (!userTotals[email]) {
          userTotals[email] = { sonnet: 0, opus: 0, total: 0 };
        }
        userTotals[email].sonnet += stats.sonnet;
        userTotals[email].opus += stats.opus;
        userTotals[email].total += stats.total;
      });
    });

    return NextResponse.json({
      dailyStats,
      userTotals,
      totalEvaluations: evaluations.length,
      dateRange: {
        start: evaluations.length > 0 ? evaluations[evaluations.length - 1].evaluatedAt.toISOString() : null,
        end: evaluations.length > 0 ? evaluations[0].evaluatedAt.toISOString() : null
      }
    }, { headers });
  } catch (error) {
    console.error('일별 사용자별 평가 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '일별 사용자별 평가 통계 조회 중 오류가 발생했습니다.' },
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