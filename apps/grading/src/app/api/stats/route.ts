import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // CORS 헤더 설정 (monorepo 내 다른 앱에서 접근 가능하도록)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 오늘 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 전체 평가 수
    const totalEvaluations = await prisma.evaluation.count();
    
    // 오늘 평가 수
    const todayEvaluations = await prisma.evaluation.count({
      where: {
        evaluatedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // AI 모델별 통계
    const evaluationsByModel = await prisma.evaluation.groupBy({
      by: ['evaluatedBy'],
      _count: {
        _all: true
      }
    });

    // 오늘 AI 모델별 통계
    const todayEvaluationsByModel = await prisma.evaluation.groupBy({
      by: ['evaluatedBy'],
      where: {
        evaluatedAt: {
          gte: today,
          lt: tomorrow
        }
      },
      _count: {
        _all: true
      }
    });

    // 모델별 통계 정리
    const modelStats = {
      sonnet: {
        total: 0,
        today: 0
      },
      opus: {
        total: 0,
        today: 0
      },
      mock: {
        total: 0,
        today: 0
      }
    };

    // 전체 통계 처리
    evaluationsByModel.forEach(item => {
      const model = (item.evaluatedBy || '').toLowerCase();
      // sonnet 모델 (claude-sonnet-4-20250514 등)
      if (model.includes('sonnet')) {
        modelStats.sonnet.total += item._count._all;
      } 
      // opus 모델 (claude-opus-20250514 등)
      else if (model.includes('opus')) {
        modelStats.opus.total += item._count._all;
      } 
      // mock 모델
      else if (model.includes('mock')) {
        modelStats.mock.total += item._count._all;
      }
    });

    // 오늘 통계 처리
    todayEvaluationsByModel.forEach(item => {
      const model = (item.evaluatedBy || '').toLowerCase();
      // sonnet 모델 (claude-sonnet-4-20250514 등)
      if (model.includes('sonnet')) {
        modelStats.sonnet.today += item._count._all;
      } 
      // opus 모델 (claude-opus-20250514 등)
      else if (model.includes('opus')) {
        modelStats.opus.today += item._count._all;
      } 
      // mock 모델
      else if (model.includes('mock')) {
        modelStats.mock.today += item._count._all;
      }
    });

    // 기타 통계
    const [totalAssignments, totalSubmissions, totalStudents] = await Promise.all([
      prisma.assignment.count(),
      prisma.submission.count(),
      prisma.studentGroup.count()
    ]);

    const stats = {
      evaluations: {
        total: totalEvaluations,
        today: todayEvaluations,
        byModel: modelStats
      },
      assignments: {
        total: totalAssignments
      },
      submissions: {
        total: totalSubmissions
      },
      students: {
        total: totalStudents
      },
      debug: {
        evaluationsByModel,
        todayEvaluationsByModel,
        todayStart: today.toISOString(),
        todayEnd: tomorrow.toISOString()
      }
    };

    return NextResponse.json(stats, { headers });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: '통계 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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