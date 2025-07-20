import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('[Submissions API] Fetching for assignmentId:', params.assignmentId);
    
    // First check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.assignmentId }
    });
    
    console.log('[Submissions API] Assignment exists:', !!assignment);
    
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: params.assignmentId,
      },
      include: {
        student: {
          include: {
            group: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('[Submissions API] Found submissions:', submissions.length);
    console.log('[Submissions API] Submission details:', submissions.map(s => ({
      id: s.id,
      studentName: s.studentName,
      createdAt: s.createdAt
    })));

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
        student: sub.student
      }))
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}