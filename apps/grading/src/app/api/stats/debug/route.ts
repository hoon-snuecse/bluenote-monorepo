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

    // 최근 10개의 평가 데이터 조회
    const recentEvaluations = await prisma.evaluation.findMany({
      take: 10,
      orderBy: { evaluatedAt: 'desc' },
      select: {
        id: true,
        evaluatedBy: true,
        evaluatedAt: true
      }
    });

    // evaluatedBy 필드의 고유 값들
    const uniqueEvaluatedBy = await prisma.evaluation.groupBy({
      by: ['evaluatedBy'],
      _count: {
        _all: true
      }
    });

    return NextResponse.json({
      recentEvaluations,
      uniqueEvaluatedBy,
      message: 'Debug information for evaluatedBy field'
    }, { headers });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
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