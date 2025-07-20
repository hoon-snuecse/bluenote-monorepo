import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const assignmentCount = await prisma.assignment.count();
    const submissionCount = await prisma.submission.count();
    
    // Get recent submissions
    const recentSubmissions = await prisma.submission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        assignment: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      counts: {
        assignments: assignmentCount,
        submissions: submissionCount
      },
      recentSubmissions: recentSubmissions.map(s => ({
        id: s.id,
        studentName: s.studentName,
        assignmentId: s.assignmentId,
        assignmentTitle: s.assignment.title,
        createdAt: s.createdAt
      })),
      environment: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}