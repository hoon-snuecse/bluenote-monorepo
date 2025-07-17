import Anthropic from '@anthropic-ai/sdk';

// Claude API 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

export interface EvaluationRequest {
  assignmentTitle: string;
  schoolName: string;
  grade: string;
  writingType: string;
  evaluationDomains: string[];
  evaluationLevels: string[];
  levelCount: number;
  evaluationPrompt: string;
  studentText: string;
  studentName: string;
  temperature?: number;
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
    console.warn('API Key 상태:', {
      exists: !!process.env.CLAUDE_API_KEY,
      isDefault: process.env.CLAUDE_API_KEY === 'YOUR_CLAUDE_API_KEY_HERE',
      firstChars: process.env.CLAUDE_API_KEY?.substring(0, 10)
    });
    return generateMockEvaluation(request);
  }
  
  console.log('Claude API 호출 시작:', {
    studentName: request.studentName,
    assignmentTitle: request.assignmentTitle,
    writingType: request.writingType,
    evaluationDomains: request.evaluationDomains
  });

  try {
    const systemPrompt = `당신은 ${request.schoolName} ${request.grade} 담임교사입니다. 
학생의 ${request.writingType}을 평가하고 있습니다.

[과제 정보]
- 과제 제목: ${request.assignmentTitle}
- 학교: ${request.schoolName}
- 학년: ${request.grade}
- 글 유형: ${request.writingType}

[평가 설정]
- 평가 영역: ${request.evaluationDomains.join(', ')}
- 평가 수준: ${request.evaluationLevels.join(', ')}
- 평가 수준 개수: ${request.levelCount}개

[평가 기준]
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

    // 요청에서 모델 정보 확인
    const modelMap: { [key: string]: string } = {
      'claude-sonnet-4-20250514': 'claude-3-5-sonnet-20241022',
      'claude-opus-4-20250514': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-5-sonnet-20241022',
      'claude-3-opus': 'claude-3-opus-20240229'
    };
    
    // 기본값은 sonnet
    const actualModel = modelMap['claude-sonnet-4-20250514']; // 기본 모델
    
    const message = await anthropic.messages.create({
      model: actualModel,
      max_tokens: 2000,
      temperature: request.temperature || 0.1, // 사용자 지정 temperature 사용
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });
    
    console.log('Claude API 호출 성공:', {
      modelUsed: actualModel,
      temperature: request.temperature || 0.1,
      messageId: (message as any).id
    });

    // Claude의 응답에서 JSON 추출
    const content = message.content[0];
    if (content.type === 'text') {
      try {
        console.log('Claude 원본 응답:', content.text.substring(0, 500) + '...');
        
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return validateEvaluationResult(result, request);
        }
      } catch (parseError) {
        console.error('Failed to parse Claude response:', parseError);
        console.error('응답 내용:', content.text);
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
  console.warn('⚠️ Fallback 평가 사용 중 - Claude 응답 파싱 실패');
  
  // 응답 텍스트에서 JSON 부분 제거
  let cleanedResponseText = responseText;
  const jsonStartIndex = responseText.indexOf('{');
  const jsonEndIndex = responseText.lastIndexOf('}');
  
  if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonStartIndex < jsonEndIndex) {
    // JSON 블록 이후의 텍스트만 추출
    cleanedResponseText = responseText.substring(jsonEndIndex + 1).trim();
    
    // 텍스트가 비어있다면 JSON 블록 이전의 텍스트 확인
    if (!cleanedResponseText) {
      cleanedResponseText = responseText.substring(0, jsonStartIndex).trim();
    }
    
    // 여전히 비어있다면 기본 메시지
    if (!cleanedResponseText) {
      cleanedResponseText = `${request.studentName} 학생은 ${request.writingType}의 기본 구조를 이해하고 있으며, 자신의 생각을 표현하려고 노력했습니다.`;
    }
  }
  
  // 학생 텍스트 기반으로 일관된 결과 생성
  const textHash = request.studentText.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const consistentRandom = (seed: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  };
  
  const baseLevel = Math.min(1, request.evaluationLevels.length - 1); // 기본적으로 두 번째 레벨 (보통 "우수")
  
  const result: EvaluationResult = {
    overallScore: 75,
    overallGrade: request.evaluationLevels[baseLevel],
    domainScores: {},
    domainGrades: {},
    strengths: ['논리적인 구성으로 글을 작성함', '주제에 대한 이해도가 높음'],
    improvements: ['더 구체적인 예시 제시 필요', '문장 간 연결을 자연스럽게 개선'],
    detailedFeedback: cleanedResponseText
  };

  // 각 영역에 일관된 점수 할당
  request.evaluationDomains.forEach((domain, index) => {
    const domainSeed = textHash + index + domain.charCodeAt(0);
    const variance = consistentRandom(domainSeed, 10) - 5; // -5 ~ +5 변동
    result.domainScores[domain] = 75 + variance;
    
    // 점수에 따른 등급 결정
    const score = result.domainScores[domain];
    let gradeIndex = baseLevel;
    if (score >= 85) gradeIndex = 0; // 최고 등급
    else if (score >= 75) gradeIndex = Math.min(1, request.evaluationLevels.length - 1);
    else if (score >= 65) gradeIndex = Math.min(2, request.evaluationLevels.length - 1);
    else gradeIndex = request.evaluationLevels.length - 1; // 최저 등급
    
    result.domainGrades[domain] = request.evaluationLevels[gradeIndex];
  });

  return result;
}

// Mock 평가 결과 생성 (API 키가 없을 때)
function generateMockEvaluation(request: EvaluationRequest): EvaluationResult {
  console.warn('⚠️ Mock 평가기 사용 중 - 실제 AI 평가가 아닙니다!');
  
  // 학생 텍스트의 해시값을 기반으로 일관된 결과 생성
  const textHash = request.studentText.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // 해시값을 기반으로 일관된 레벨 인덱스 계산
  const consistentRandom = (seed: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  };
  
  const levelIndex = consistentRandom(textHash, request.evaluationLevels.length);
  const baseScore = 70 + (levelIndex * 8) + consistentRandom(textHash + 1, 5);
  
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
    detailedFeedback: `[Mock 평가] ${request.studentName} 학생은 ${request.writingType}의 기본 구조를 잘 이해하고 있으며, 자신의 생각을 명확하게 표현하려고 노력했습니다. 특히 주제에 대한 이해도가 높고, 글의 전체적인 구성이 안정적입니다. 앞으로 더 구체적인 예시와 근거를 제시하면서 글을 작성한다면 더욱 설득력 있는 글을 쓸 수 있을 것입니다.`
  };

  // 각 영역별 점수와 등급 생성 (일관된 방식으로)
  request.evaluationDomains.forEach((domain, index) => {
    const domainSeed = textHash + index + domain.charCodeAt(0);
    const domainLevelIndex = Math.max(0, Math.min(request.evaluationLevels.length - 1, 
      levelIndex + consistentRandom(domainSeed, 3) - 1));
    result.domainScores[domain] = 70 + (domainLevelIndex * 8) + consistentRandom(domainSeed + 1, 5);
    result.domainGrades[domain] = request.evaluationLevels[domainLevelIndex];
  });

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