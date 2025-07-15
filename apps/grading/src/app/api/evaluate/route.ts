import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    const { studentIds } = await request.json();

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs required' },
        { status: 400 }
      );
    }

    // Get imported documents
    const cookieStore = await cookies();
    const importedDocsData = cookieStore.get('imported_documents')?.value;
    
    if (!importedDocsData) {
      return NextResponse.json(
        { error: 'No imported documents found' },
        { status: 404 }
      );
    }

    const importedDocs = JSON.parse(importedDocsData);
    
    // Get evaluations from cookie (in production, use database)
    const evaluationsData = cookieStore.get('evaluations')?.value;
    const evaluations = evaluationsData ? JSON.parse(evaluationsData) : {};

    const results = [];

    for (const studentId of studentIds) {
      // Extract index from studentId (format: "student-1")
      const index = parseInt(studentId.split('-')[1]) - 1;
      const doc = importedDocs[index];

      if (!doc) {
        continue;
      }

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
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: EVALUATION_PROMPT + doc.content,
              },
            ],
          }),
        });

        if (!response.ok) {
          console.error('Claude API error:', response.status);
          continue;
        }

        const data = await response.json();
        const content = data.content[0].text;
        
        // Parse the JSON response
        const evaluation = JSON.parse(content);
        
        // Calculate overall score
        const { clarity, evidence, structure, expression } = evaluation.scores;
        evaluation.scores.overall = Math.round((clarity + evidence + structure + expression) / 4);
        
        // Determine grade based on overall score
        if (evaluation.scores.overall >= 90) {
          evaluation.grade = '매우 우수';
        } else if (evaluation.scores.overall >= 80) {
          evaluation.grade = '우수';
        } else if (evaluation.scores.overall >= 70) {
          evaluation.grade = '보통';
        } else {
          evaluation.grade = '미흡';
        }

        // Store evaluation
        evaluations[studentId] = {
          ...evaluation,
          evaluatedAt: new Date().toISOString(),
        };

        results.push({
          studentId,
          status: 'completed',
          evaluation,
        });
      } catch (error) {
        console.error('Error evaluating student:', studentId, error);
        results.push({
          studentId,
          status: 'error',
          error: 'Failed to evaluate',
        });
      }
    }

    // Save evaluations to cookie (in production, use database)
    cookieStore.set('evaluations', JSON.stringify(evaluations), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      evaluated: results.filter(r => r.status === 'completed').length,
      failed: results.filter(r => r.status === 'error').length,
      results,
    });
  } catch (error) {
    console.error('Error in evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate documents' },
      { status: 500 }
    );
  }
}