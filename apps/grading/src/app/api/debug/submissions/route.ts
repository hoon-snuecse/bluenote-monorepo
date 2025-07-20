import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assignmentId = searchParams.get('assignmentId');
  
  try {
    if (assignmentId) {
      // 특정 과제의 제출물 조회
      const submissions = await prisma.submission.findMany({
        where: { assignmentId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId }
      });
      
      return NextResponse.json({
        assignmentId,
        assignmentExists: !!assignment,
        assignmentTitle: assignment?.title,
        submissionCount: submissions.length,
        submissions: submissions.map(s => ({
          id: s.id,
          studentName: s.studentName,
          studentId: s.studentId,
          contentLength: s.content?.length || 0,
          createdAt: s.createdAt,
          submittedAt: s.submittedAt
        }))
      });
    } else {
      // 최근 제출물 조회
      const recentSubmissions = await prisma.submission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
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
        totalSubmissions: await prisma.submission.count(),
        recentSubmissions: recentSubmissions.map(s => ({
          id: s.id,
          assignmentId: s.assignmentId,
          assignmentTitle: s.assignment.title,
          studentName: s.studentName,
          createdAt: s.createdAt
        }))
      });
    }
  } catch (error) {
    console.error('[Debug Submissions] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch submissions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}