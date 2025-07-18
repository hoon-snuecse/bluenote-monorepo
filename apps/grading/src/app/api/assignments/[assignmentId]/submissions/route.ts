import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('Fetching submissions for assignmentId:', params.assignmentId);
    
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: params.assignmentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('Found submissions:', submissions.length);

    return NextResponse.json({
      success: true,
      submissions: submissions.map(sub => ({
        id: sub.id,
        studentId: sub.studentId,
        studentName: sub.studentName,
        content: sub.content,
        submittedAt: sub.createdAt,
        evaluatedAt: sub.evaluatedAt,
        evaluation: sub.evaluation,
        status: sub.evaluatedAt ? 'evaluated' : 'submitted'
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