import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || 'unknown',
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'connected';
  } catch (error) {
    health.status = 'degraded';
    health.services.database = 'disconnected';
  }

  // Return appropriate status code
  const statusCode = health.status === 'ok' ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}