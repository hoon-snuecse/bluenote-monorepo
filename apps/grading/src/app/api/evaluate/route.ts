import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const createEvaluationPrompt = (assignment: any, content: string) => {
  const domains = assignment.evaluationDomains as string[];
  const levels = assignment.evaluationLevels as string[];
  
  return `당신은 ${assignment.gradeLevel} 국어 교사입니다. 학생의 ${assignment.writingType}을(를) 다음 ${domains.length}가지 기준으로 평가해주세요:

${domains.map((domain, index) => `${index + 1}. ${domain}: 이 영역에서 학생의 글쓰기 수준을 평가해주세요.`).join('\n')}

각 항목을 100점 만점으로 평가하고, 구체적인 피드백을 제공해주세요.
평가 수준은 다음 중 하나로 분류해주세요: ${levels.join(', ')}

평가 기준:
${assignment.gradingCriteria}

응답 형식 (반드시 JSON 형식으로):
{
  "scores": {
    ${domains.map((domain, index) => `"domain${index + 1}": 점수`).join(',\n    ')}
  },
  "grade": "${levels.join('|')} 중 하나",
  "feedback": {
    ${domains.map((domain, index) => `"domain${index + 1}": "${domain}에 대한 구체적 피드백"`).join(',\n    ')},
    "overall": "종합 피드백"
  }
}

학생의 글:
${content}`;
};

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

    // Check if API key is configured
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not configured');
      return NextResponse.json(
        { 
          error: 'AI evaluation service is not configured',
          details: 'CLAUDE_API_KEY environment variable is missing',
          success: false
        },
        { status: 500 }
      );
    }
    
    console.log('CLAUDE_API_KEY is configured:', process.env.CLAUDE_API_KEY?.substring(0, 10) + '...');

    try {
      // Call Claude API for evaluation
      console.log('Calling Claude API with model:', model || 'claude-3-5-sonnet-20241022');
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'messages-2023-12-15',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: createEvaluationPrompt(submission.assignment, submission.content),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Claude API error:', response.status, errorData);
        throw new Error(`Claude API failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Claude API response:', JSON.stringify(data).substring(0, 200));
      
      const content = data.content[0].text;
      console.log('AI evaluation content:', content.substring(0, 200));
      
      // Parse the JSON response
      let aiEvaluation;
      try {
        aiEvaluation = JSON.parse(content);
        console.log('Parsed evaluation:', aiEvaluation);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Failed to parse AI evaluation response');
      }
      
      // Map AI evaluation to our domain structure
      const domainEvaluations: any = {};
      const domains = submission.assignment.evaluationDomains as string[];
      
      // Assign evaluation levels based on scores
      domains.forEach((domain, index) => {
        const score = (aiEvaluation.scores as any)[`domain${index + 1}`];
        let level;
        if (score >= 90) level = evaluationLevels[0] || '매우 우수';
        else if (score >= 80) level = evaluationLevels[1] || '우수';
        else if (score >= 70) level = evaluationLevels[2] || '보통';
        else level = evaluationLevels[3] || '미흡';
        
        domainEvaluations[domain] = level;
      });

      console.log('Creating evaluation with data:', {
        submissionId,
        assignmentId,
        domainEvaluations,
        overallLevel: aiEvaluation.grade
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
          improvementSuggestions: domains.map((domain, index) => 
            aiEvaluation.feedback[`domain${index + 1}`]
          ).filter(Boolean),
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