import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('Fetching evaluations for assignmentId:', params.assignmentId);
    
    // Get all submissions with their evaluations
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: params.assignmentId,
      },
      include: {
        evaluations: {
          orderBy: {
            evaluatedAt: 'desc'
          },
          take: 1 // Get only the latest evaluation
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('Found submissions with evaluations:', submissions.length);
    console.log('Submissions details:', submissions.map(s => ({
      id: s.id,
      studentName: s.studentName,
      evaluationCount: s.evaluations.length,
      hasEvaluation: s.evaluations.length > 0
    })));

    // Transform the data
    const evaluations = submissions.map(sub => {
      const latestEvaluation = sub.evaluations[0];
      
      return {
        id: sub.id,
        studentName: sub.studentName,
        studentId: sub.studentId,
        submittedAt: sub.submittedAt,
        evaluatedAt: latestEvaluation?.evaluatedAt || null,
        domainScores: latestEvaluation?.domainEvaluations || {},
        overallLevel: latestEvaluation?.overallLevel || null,
        overallFeedback: latestEvaluation?.overallFeedback || null,
        status: latestEvaluation ? 'evaluated' : 'submitted'
      };
    });

    return NextResponse.json({
      success: true,
      evaluations
    });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}