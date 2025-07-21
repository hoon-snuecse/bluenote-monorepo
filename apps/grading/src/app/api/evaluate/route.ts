import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateWithClaude, EvaluationRequest } from '@/lib/claude-api';

export async function POST(request: NextRequest) {
  try {
    const { submissionId, assignmentId, model } = await request.json();
    console.log('Evaluate API called:', { submissionId, assignmentId, model });

    if (!submissionId || !assignmentId) {
      return NextResponse.json(
        { error: 'Submission ID and Assignment ID required' },
        { status: 400 }
      );
    }

    // Get submission with assignment details
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const evaluationLevels = submission.assignment.evaluationLevels as string[];
    const evaluationDomains = submission.assignment.evaluationDomains as string[];

    try {
      // Use claude-api.ts for evaluation
      const evaluationRequest: EvaluationRequest = {
        assignmentTitle: submission.assignment.title,
        schoolName: submission.assignment.schoolName || '우리학교',
        grade: submission.assignment.gradeLevel,
        writingType: submission.assignment.writingType,
        evaluationDomains: evaluationDomains,
        evaluationLevels: evaluationLevels,
        levelCount: evaluationLevels.length,
        evaluationPrompt: submission.assignment.gradingCriteria || '학생의 글쓰기 능력을 종합적으로 평가해주세요.',
        studentText: submission.content,
        studentName: submission.studentName,
        temperature: 0.7,
        aiModel: model || 'claude-sonnet-4-20250514'
      };

      console.log('Calling evaluateWithClaude with:', {
        studentName: evaluationRequest.studentName,
        aiModel: evaluationRequest.aiModel
      });

      const aiEvaluation = await evaluateWithClaude(evaluationRequest);
      
      console.log('AI evaluation result:', {
        overallScore: aiEvaluation.overallScore,
        overallGrade: aiEvaluation.overallGrade,
        domainScores: aiEvaluation.domainScores
      });

      // Map domain scores to evaluation levels
      const domainEvaluations: Record<string, string> = {};
      
      evaluationDomains.forEach((domain) => {
        const score = aiEvaluation.domainScores[domain] || 75;
        let level;
        
        if (score >= 90) level = evaluationLevels[0] || '매우 우수';
        else if (score >= 80) level = evaluationLevels[1] || '우수';
        else if (score >= 70) level = evaluationLevels[2] || '보통';
        else level = evaluationLevels[3] || '미흡';
        
        domainEvaluations[domain] = aiEvaluation.domainGrades[domain] || level;
      });

      console.log('Creating evaluation with data:', {
        submissionId,
        assignmentId,
        domainEvaluations,
        overallLevel: aiEvaluation.overallGrade
      });

      // Create evaluation record
      const evaluation = await prisma.evaluation.create({
        data: {
          submissionId,
          assignmentId,
          studentId: submission.studentId,
          domainEvaluations,
          overallLevel: aiEvaluation.overallGrade,
          overallFeedback: aiEvaluation.detailedFeedback,
          improvementSuggestions: aiEvaluation.improvements,
          strengths: aiEvaluation.strengths,
          evaluatedBy: model || 'claude-sonnet-4-20250514'
        }
      });

      // Update submission
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          evaluatedAt: new Date(),
          evaluation: {
            domainEvaluations,
            overallLevel: aiEvaluation.overallGrade,
            overallFeedback: aiEvaluation.detailedFeedback
          }
        }
      });

      console.log('Evaluation created successfully:', evaluation.id);

      return NextResponse.json({
        success: true,
        evaluation: {
          id: evaluation.id,
          overallLevel: evaluation.overallLevel,
          domainEvaluations: evaluation.domainEvaluations
        }
      });
    } catch (error) {
      console.error('Error in evaluation:', error);
      return NextResponse.json(
        { 
          error: 'Failed to evaluate', 
          details: error instanceof Error ? error.message : 'Unknown error',
          success: false 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in evaluation request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process evaluation request', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}