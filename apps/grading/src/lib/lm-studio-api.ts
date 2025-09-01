import OpenAI from 'openai';

// LM Studio 설정
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';
const LM_STUDIO_ENABLED = process.env.LM_STUDIO_ENABLED === 'true';

// OpenAI 클라이언트 초기화 (LM Studio는 OpenAI 호환 API 제공)
const lmStudioClient = new OpenAI({
  baseURL: LM_STUDIO_URL,
  apiKey: 'not-needed', // LM Studio는 API 키가 필요 없음
});

export interface LMStudioEvaluationRequest {
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

export interface LMStudioEvaluationResult {
  overallScore: number;
  overallGrade: string;
  domainScores: { [domain: string]: number };
  domainGrades: { [domain: string]: string };
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

// LM Studio 서버 상태 확인
export async function checkLMStudioStatus(): Promise<{ available: boolean; models?: string[] }> {
  if (!LM_STUDIO_ENABLED) {
    return { available: false };
  }

  try {
    const response = await fetch(`${LM_STUDIO_URL}/models`);
    if (response.ok) {
      const data = await response.json();
      const models = data.data?.map((m: any) => m.id) || [];
      console.log('LM Studio 서버 상태: 정상', { models });
      return { available: true, models };
    }
  } catch (error) {
    console.error('LM Studio 서버 연결 실패:', error);
  }
  
  return { available: false };
}

// LM Studio를 사용한 평가
export async function evaluateWithLMStudio(request: LMStudioEvaluationRequest): Promise<LMStudioEvaluationResult> {
  console.log('LM Studio 평가 시작:', {
    studentName: request.studentName,
    assignmentTitle: request.assignmentTitle,
    model: 'openai/gpt-oss-20b'
  });

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

  try {
    const completion = await lmStudioClient.chat.completions.create({
      model: 'openai/gpt-oss-20b', // LM Studio에 로드된 모델명
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: request.temperature || 0.1,
      max_tokens: 2000,
    });

    console.log('LM Studio 응답 수신 완료');
    
    const response = completion.choices[0]?.message?.content || '';
    
    // JSON 파싱 시도
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return validateLMStudioResult(result, request);
      }
    } catch (parseError) {
      console.error('LM Studio 응답 파싱 실패:', parseError);
      console.log('원본 응답:', response.substring(0, 500));
    }

    // 파싱 실패 시 기본 결과 반환
    return generateFallbackResult(request, response);
    
  } catch (error) {
    console.error('LM Studio API 호출 실패:', error);
    throw new Error(`LM Studio 평가 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 결과 검증 및 보정
function validateLMStudioResult(result: any, request: LMStudioEvaluationRequest): LMStudioEvaluationResult {
  const validated: LMStudioEvaluationResult = {
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

// 폴백 결과 생성
function generateFallbackResult(request: LMStudioEvaluationRequest, responseText: string): LMStudioEvaluationResult {
  console.warn('LM Studio 폴백 평가 사용');
  
  const result: LMStudioEvaluationResult = {
    overallScore: 75,
    overallGrade: request.evaluationLevels[1] || '우수',
    domainScores: {},
    domainGrades: {},
    strengths: ['논리적인 구성으로 글을 작성함', '주제에 대한 이해도가 높음'],
    improvements: ['더 구체적인 예시 제시 필요', '문장 간 연결을 자연스럽게 개선'],
    detailedFeedback: responseText.substring(0, 500) || 
      `${request.studentName} 학생은 ${request.writingType}의 기본 구조를 이해하고 있으며, 자신의 생각을 표현하려고 노력했습니다.`
  };

  // 각 영역에 기본 점수 할당
  request.evaluationDomains.forEach(domain => {
    result.domainScores[domain] = 75;
    result.domainGrades[domain] = request.evaluationLevels[1] || '우수';
  });

  return result;
}