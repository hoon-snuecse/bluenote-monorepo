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

    // 모델별 사용자 통계 집계
    const evaluations = await prisma.evaluation.findMany({
      select: {
        evaluatedBy: true,
        submission: {
          select: {
            studentName: true
          }
        }
      }
    });

    // 사용자별, 모델별 집계
    const userModelStats: Record<string, Record<string, number>> = {};
    
    evaluations.forEach(evaluation => {
      const studentName = evaluation.submission?.studentName || 'Unknown';
      const model = (evaluation.evaluatedBy || '').toLowerCase();
      
      if (!userModelStats[studentName]) {
        userModelStats[studentName] = {
          sonnet: 0,
          opus: 0
        };
      }
      
      if (model.includes('sonnet')) {
        userModelStats[studentName].sonnet++;
      } else if (model.includes('opus')) {
        userModelStats[studentName].opus++;
      }
    });

    // 모델별 상위 사용자 추출
    const sonnetUsers = Object.entries(userModelStats)
      .map(([name, stats]) => ({ name, count: stats.sonnet }))
      .filter(user => user.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const opusUsers = Object.entries(userModelStats)
      .map(([name, stats]) => ({ name, count: stats.opus }))
      .filter(user => user.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      sonnetTopUsers: sonnetUsers,
      opusTopUsers: opusUsers
    }, { headers });
  } catch (error) {
    console.error('사용자 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 통계 조회 중 오류가 발생했습니다.' },
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