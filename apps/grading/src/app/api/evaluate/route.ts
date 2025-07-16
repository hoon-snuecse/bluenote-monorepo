import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const EVALUATION_PROMPT = `당신은 고등학교 국어 교사입니다. 학생의 논설문을 다음 4가지 기준으로 평가해주세요:

1. 주장의 명확성 (25점): 글의 주제와 주장이 명확하게 드러나는가?
2. 근거의 타당성 (25점): 주장을 뒷받침하는 근거가 타당하고 충분한가?
3. 논리적 구조 (25점): 글의 구성이 논리적이고 체계적인가?
4. 설득력 있는 표현 (25점): 어휘 선택과 문장 표현이 설득력 있는가?

각 항목을 100점 만점으로 평가하고, 구체적인 피드백을 제공해주세요.

응답 형식:
{
  "scores": {
    "clarity": 점수,
    "evidence": 점수,
    "structure": 점수,
    "expression": 점수,
    "overall": 종합점수
  },
  "grade": "매우 우수|우수|보통|미흡",
  "feedback": {
    "clarity": "구체적 피드백",
    "evidence": "구체적 피드백",
    "structure": "구체적 피드백",
    "expression": "구체적 피드백",
    "overall": "종합 피드백"
  }
}

학생의 논설문:
`;

export async function POST(request: NextRequest) {
  try {
    const { submissionId, assignmentId, model } = await request.json();

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

    try {
      // Call Claude API for evaluation
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: EVALUATION_PROMPT + submission.content,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error('Claude API error:', response.status);
        throw new Error('Claude API failed');
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Parse the JSON response
      const aiEvaluation = JSON.parse(content);
      
      // Map AI evaluation to our domain structure
      const domainEvaluations: any = {};
      const domainMapping: any = {
        'clarity': '주장의 명확성',
        'evidence': '근거의 타당성',
        'structure': '논리적 구조',
        'expression': '설득력 있는 표현'
      };
      
      // Assign evaluation levels based on scores
      Object.entries(domainMapping).forEach(([key, domain]) => {
        const score = (aiEvaluation.scores as any)[key];
        let level;
        if (score >= 90) level = evaluationLevels[0] || '매우 우수';
        else if (score >= 80) level = evaluationLevels[1] || '우수';
        else if (score >= 70) level = evaluationLevels[2] || '보통';
        else level = evaluationLevels[3] || '미흡';
        
        domainEvaluations[domain as string] = level;
      });

      // Create evaluation record
      const evaluation = await prisma.evaluation.create({
        data: {
          submissionId,
          assignmentId,
          studentId: submission.studentId,
          domainEvaluations,
          overallLevel: aiEvaluation.grade,
          overallFeedback: aiEvaluation.feedback.overall,
          improvementSuggestions: [
            aiEvaluation.feedback.clarity,
            aiEvaluation.feedback.evidence,
            aiEvaluation.feedback.structure,
            aiEvaluation.feedback.expression
          ].filter(Boolean),
          strengths: [
            "글의 구조가 체계적입니다",
            "주제에 대한 이해도가 높습니다",
            "문장이 명확하고 읽기 쉽습니다"
          ],
          evaluatedBy: model || 'claude-3-5-sonnet-20241022'
        }
      });

      // Update submission
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          evaluatedAt: new Date(),
          evaluation: {
            domainEvaluations,
            overallLevel: aiEvaluation.grade,
            overallFeedback: aiEvaluation.feedback.overall
          }
        }
      });

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
      { error: 'Failed to evaluate documents' },
      { status: 500 }
    );
  }
}