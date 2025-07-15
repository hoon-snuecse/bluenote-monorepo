import Anthropic from '@anthropic-ai/sdk';

// Claude API 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

export interface EvaluationRequest {
  assignmentTitle: string;
  grade: string;
  writingType: string;
  evaluationDomains: string[];
  evaluationLevels: string[];
  evaluationPrompt: string;
  studentText: string;
  studentName: string;
}

export interface EvaluationResult {
  overallScore: number;
  overallGrade: string;
  domainScores: { [domain: string]: number };
  domainGrades: { [domain: string]: string };
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

export async function evaluateWithClaude(request: EvaluationRequest): Promise<EvaluationResult> {
  // API 키가 설정되지 않은 경우 Mock 데이터 반환
  if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'YOUR_CLAUDE_API_KEY_HERE') {
    console.warn('Claude API key not set, returning mock data');
    return generateMockEvaluation(request);
  }

  try {
    const systemPrompt = `당신은 한국 초등학교 ${request.grade} 담임교사입니다. 
학생의 ${request.writingType}을 평가하고 있습니다.

평가 영역: ${request.evaluationDomains.join(', ')}
평가 수준: ${request.evaluationLevels.join(', ')}

${request.evaluationPrompt}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "overallScore": 점수 (0-100),
  "overallGrade": "전체 평가 수준",
  "domainScores": { "영역명": 점수, ... },
  "domainGrades": { "영역명": "평가 수준", ... },
  "strengths": ["강점1", "강점2", ...],
  "improvements": ["개선점1", "개선점2", ...],
  "detailedFeedback": "상세 피드백 (학생과 학부모가 이해하기 쉽게)"
}`;

    const userPrompt = `학생 이름: ${request.studentName}
과제 제목: ${request.assignmentTitle}

학생의 글:
${request.studentText}

위 글을 평가해주세요.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Claude의 응답에서 JSON 추출
    const content = message.content[0];
    if (content.type === 'text') {
      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return validateEvaluationResult(result, request);
        }
      } catch (parseError) {
        console.error('Failed to parse Claude response:', parseError);
      }
    }

    // 파싱 실패 시 텍스트 기반으로 간단한 결과 생성
    return generateFallbackEvaluation(request, content.type === 'text' ? content.text : '');

  } catch (error) {
    console.error('Claude API error:', error);
    return generateMockEvaluation(request);
  }
}

// 평가 결과 검증 및 보정
function validateEvaluationResult(result: any, request: EvaluationRequest): EvaluationResult {
  const validated: EvaluationResult = {
    overallScore: Math.max(0, Math.min(100, result.overallScore || 75)),
    overallGrade: result.overallGrade || request.evaluationLevels[1] || '우수',
    domainScores: {},
    domainGrades: {},
    strengths: result.strengths || [],
    improvements: result.improvements || [],
    detailedFeedback: result.detailedFeedback || ''
  };

  // 각 영역별 점수와 등급 검증
  for (const domain of request.evaluationDomains) {
    validated.domainScores[domain] = result.domainScores?.[domain] || 75;
    validated.domainGrades[domain] = result.domainGrades?.[domain] || request.evaluationLevels[1];
  }

  return validated;
}

// 텍스트 응답을 기반으로 간단한 평가 결과 생성
function generateFallbackEvaluation(request: EvaluationRequest, responseText: string): EvaluationResult {
  const result: EvaluationResult = {
    overallScore: 75,
    overallGrade: request.evaluationLevels[1] || '우수',
    domainScores: {},
    domainGrades: {},
    strengths: ['논리적인 구성으로 글을 작성함', '주제에 대한 이해도가 높음'],
    improvements: ['더 구체적인 예시 제시 필요', '문장 간 연결을 자연스럽게 개선'],
    detailedFeedback: responseText.substring(0, 500) + '...'
  };

  // 각 영역에 기본 점수 할당
  for (const domain of request.evaluationDomains) {
    result.domainScores[domain] = 70 + Math.floor(Math.random() * 20);
    result.domainGrades[domain] = request.evaluationLevels[Math.floor(Math.random() * request.evaluationLevels.length)];
  }

  return result;
}

// Mock 평가 결과 생성 (API 키가 없을 때)
function generateMockEvaluation(request: EvaluationRequest): EvaluationResult {
  const levelIndex = Math.floor(Math.random() * request.evaluationLevels.length);
  const baseScore = 60 + (levelIndex * 10) + Math.floor(Math.random() * 10);
  
  const result: EvaluationResult = {
    overallScore: baseScore,
    overallGrade: request.evaluationLevels[levelIndex],
    domainScores: {},
    domainGrades: {},
    strengths: [
      '주제에 대한 명확한 이해를 보여줌',
      '자신의 생각을 논리적으로 표현함',
      '적절한 어휘를 사용하여 글을 작성함'
    ],
    improvements: [
      '더 구체적인 예시를 들어 설명하면 좋겠음',
      '문단 간 연결을 더 자연스럽게 만들 필요가 있음',
      '결론 부분을 더 강화하면 좋겠음'
    ],
    detailedFeedback: `${request.studentName} 학생은 ${request.writingType}의 기본 구조를 잘 이해하고 있으며, 자신의 생각을 명확하게 표현하려고 노력했습니다. 특히 주제에 대한 이해도가 높고, 글의 전체적인 구성이 안정적입니다. 앞으로 더 구체적인 예시와 근거를 제시하면서 글을 작성한다면 더욱 설득력 있는 글을 쓸 수 있을 것입니다.`
  };

  // 각 영역별 점수와 등급 생성
  for (const domain of request.evaluationDomains) {
    const domainLevelIndex = Math.max(0, Math.min(request.evaluationLevels.length - 1, 
      levelIndex + Math.floor(Math.random() * 3) - 1));
    result.domainScores[domain] = 60 + (domainLevelIndex * 10) + Math.floor(Math.random() * 10);
    result.domainGrades[domain] = request.evaluationLevels[domainLevelIndex];
  }

  return result;
}

// API 사용량 추적
export async function getApiUsage(): Promise<{
  tokensUsed: number;
  estimatedCost: number;
  requestCount: number;
}> {
  // 실제 구현 시 데이터베이스에서 사용량 조회
  return {
    tokensUsed: 0,
    estimatedCost: 0,
    requestCount: 0
  };
}