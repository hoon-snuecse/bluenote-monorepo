import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('[Submissions API] GET request for assignmentId:', params.assignmentId);
    
    // First check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.assignmentId }
    });
    
    console.log('[Submissions API] Assignment found:', !!assignment);
    if (!assignment) {
      return NextResponse.json({
        success: false,
        error: 'Assignment not found',
        submissions: []
      });
    }
    
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: params.assignmentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('[Submissions API] Query result:', {
      totalFound: submissions.length,
      assignmentId: params.assignmentId,
      submissions: submissions.map(s => ({
        id: s.id,
        studentName: s.studentName,
        studentId: s.studentId,
        createdAt: s.createdAt,
        hasContent: !!s.content,
        contentLength: s.content?.length || 0
      }))
    });

    return NextResponse.json({
      success: true,
      submissions: submissions.map(sub => ({
        id: sub.id,
        studentId: sub.studentId,
        studentName: sub.studentName,
        studentDbId: sub.studentDbId,
        content: sub.content,
        submittedAt: sub.createdAt,
        evaluatedAt: sub.evaluatedAt,
        evaluation: sub.evaluation,
        status: sub.evaluatedAt ? 'evaluated' : 'submitted',
        student: null // 학생 그룹과 연결되지 않은 제출물
      }))
    });
  } catch (error) {
    console.error('[Submissions API] Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}