import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
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
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 }
    );
  }
}