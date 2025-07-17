import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('Fetching evaluations for assignmentId:', params.assignmentId);
    
    // Get all submissions with ALL their evaluations
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: params.assignmentId,
      },
      include: {
        evaluations: {
          orderBy: {
            evaluatedAt: 'desc'
          }
          // Removed take: 1 to get all evaluations
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

    // Transform the data - include evaluation history
    const evaluations = submissions.map(sub => {
      const latestEvaluation = sub.evaluations[0];
      const evaluationHistory = sub.evaluations.map((evaluation, index) => ({
        evaluationId: evaluation.id,
        round: sub.evaluations.length - index, // 차수 (최신이 가장 높은 번호)
        evaluatedAt: evaluation.evaluatedAt,
        overallLevel: evaluation.overallLevel,
        domainScores: evaluation.domainEvaluations
      }));
      
      return {
        id: sub.id,
        studentName: sub.studentName,
        studentId: sub.studentId,
        submittedAt: sub.submittedAt,
        evaluatedAt: latestEvaluation?.evaluatedAt || null,
        domainScores: latestEvaluation?.domainEvaluations || {},
        overallLevel: latestEvaluation?.overallLevel || null,
        overallFeedback: latestEvaluation?.overallFeedback || null,
        status: latestEvaluation ? 'evaluated' : 'submitted',
        evaluationCount: sub.evaluations.length,
        evaluationHistory: evaluationHistory
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