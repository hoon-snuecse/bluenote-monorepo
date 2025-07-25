import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$queryRaw`SELECT 1`;
    
    // 테이블 존재 확인
    const evaluationCount = await prisma.evaluation.count();
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      evaluationCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}