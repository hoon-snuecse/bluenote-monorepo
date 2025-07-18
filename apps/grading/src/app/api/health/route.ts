import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`
    
    // 기본 시스템 정보
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      checks: {
        database: 'connected',
        authentication: process.env.NEXTAUTH_SECRET ? 'configured' : 'not configured',
        ai: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured',
      }
    }
    
    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 503 }
    )
  }
}