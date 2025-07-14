import type { EvaluationResult, Student, DomainKey } from '@/types/grading';
import { DOMAIN_MAP } from '@/types/grading';

interface AIEvaluationRequest {
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  rubricId: string;
  content: string;
}

interface AIEvaluationResponse {
  overallScore: number;
  overallLevel: string;
  holisticFeedback: string;
  domainScores: Record<DomainKey, {
    score: number;
    level: string;
    feedback: string;
  }>;
}

// AI 평가 프롬프트 생성
function createEvaluationPrompt(request: AIEvaluationRequest): string {
  return `
다음 학생의 글쓰기를 평가해주세요.

과제: ${request.assignmentTitle}

학생 글:
${request.content}

평가 기준:
1. 주장의 명확성 (25%)
2. 근거의 타당성 (25%)
3. 논리적 구조 (25%)
4. 설득력 있는 표현 (25%)

각 영역을 100점 만점으로 평가하고, 전체 평균 점수를 계산해주세요.
등급은 다음과 같이 부여합니다:
- 85점 이상: 매우 우수
- 70-84점: 우수
- 55-69점: 보통
- 54점 이하: 미흡

각 영역별로 구체적인 피드백을 제공하고, 전체적인 총평도 작성해주세요.
`;
}

// Mock AI 평가 함수 (실제로는 OpenAI API 등을 호출)
async function callAIAPI(prompt: string): Promise<AIEvaluationResponse> {
  // 실제 구현에서는 OpenAI API 호출
  // const response = await openai.createChatCompletion({
  //   model: "gpt-4",
  //   messages: [{ role: "user", content: prompt }],
  // });

  // Mock response
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 지연

  // 랜덤한 점수 생성 (실제로는 AI가 평가)
  const generateScore = () => 55 + Math.floor(Math.random() * 40);
  
  const scores = {
    clarity: generateScore(),
    validity: generateScore(),
    structure: generateScore(),
    expression: generateScore(),
  };

  const avgScore = Math.round(
    (scores.clarity + scores.validity + scores.structure + scores.expression) / 4
  );

  const getLevel = (score: number) => {
    if (score >= 85) return '매우 우수';
    if (score >= 70) return '우수';
    if (score >= 55) return '보통';
    return '미흡';
  };

  const getFeedback = (domain: DomainKey, score: number) => {
    const level = getLevel(score);
    const feedbacks = {
      clarity: {
        '매우 우수': '주장이 매우 명확하고 일관되게 제시되어 있습니다. 독자가 글의 핵심 메시지를 즉시 이해할 수 있도록 체계적으로 구성되어 있습니다.',
        '우수': '주장이 명확하게 드러나 있으며, 전반적으로 일관성을 유지하고 있습니다.',
        '보통': '기본적인 주장은 제시되어 있으나, 부분적으로 불명확하거나 일관성이 부족한 부분이 있습니다.',
        '미흡': '주장이 불명확하고 글 전체에서 일관된 논지를 찾기 어렵습니다.'
      },
      validity: {
        '매우 우수': '구체적이고 신뢰할 수 있는 근거를 충분히 제시하여 주장을 효과적으로 뒷받침하고 있습니다.',
        '우수': '적절한 근거를 제시하여 주장을 뒷받침하고 있습니다.',
        '보통': '근거를 제시하고 있으나 일부는 타당성이 부족하거나 구체성이 떨어집니다.',
        '미흡': '근거가 부족하거나 주장과의 연관성이 약합니다.'
      },
      structure: {
        '매우 우수': '서론-본론-결론의 구조가 매우 체계적이며, 단락 간 연결이 자연스럽습니다.',
        '우수': '전체적인 구조가 잘 갖춰져 있고 논리적 흐름이 적절합니다.',
        '보통': '기본적인 구조는 갖추었으나 일부 논리적 비약이나 연결 부족이 있습니다.',
        '미흡': '구조가 체계적이지 못하고 논리적 흐름이 부족합니다.'
      },
      expression: {
        '매우 우수': '다양하고 풍부한 어휘와 문장 구조를 활용하여 매우 설득력 있게 표현하고 있습니다.',
        '우수': '적절한 어휘와 문장을 사용하여 효과적으로 표현하고 있습니다.',
        '보통': '기본적인 표현은 적절하나 다양성이나 설득력이 부족합니다.',
        '미흡': '표현이 단조롭고 어휘 선택이 부적절한 경우가 있습니다.'
      }
    };

    return feedbacks[domain][level as keyof typeof feedbacks.clarity];
  };

  return {
    overallScore: avgScore,
    overallLevel: getLevel(avgScore),
    holisticFeedback: `학생은 전반적으로 ${getLevel(avgScore)} 수준의 글쓰기 능력을 보여주었습니다. 논리적 사고와 표현 능력이 균형있게 발달하고 있으며, 지속적인 연습을 통해 더욱 향상될 수 있을 것으로 기대됩니다.`,
    domainScores: {
      clarity: {
        score: scores.clarity,
        level: getLevel(scores.clarity),
        feedback: getFeedback('clarity', scores.clarity)
      },
      validity: {
        score: scores.validity,
        level: getLevel(scores.validity),
        feedback: getFeedback('validity', scores.validity)
      },
      structure: {
        score: scores.structure,
        level: getLevel(scores.structure),
        feedback: getFeedback('structure', scores.structure)
      },
      expression: {
        score: scores.expression,
        level: getLevel(scores.expression),
        feedback: getFeedback('expression', scores.expression)
      }
    }
  };
}

// 성장 예시 생성 함수
function generateGrowthExample(domain: DomainKey, level: string) {
  // 실제로는 더 정교한 예시 생성 로직 필요
  const examples = {
    clarity: {
      before: '환경을 지켜야 합니다.',
      after: '미래 세대를 위해 지금 당장 환경 보호를 실천해야 합니다.'
    },
    validity: {
      before: '플라스틱이 나쁩니다.',
      after: '매년 800만 톤의 플라스틱이 바다로 유입되어 해양 생태계를 파괴하고 있습니다.'
    },
    structure: {
      before: '환경이 중요합니다. 쓰레기를 줄여야 합니다.',
      after: '서론: 환경 문제의 심각성\n본론: 개인이 실천할 수 있는 방법\n결론: 작은 실천의 중요성'
    },
    expression: {
      before: '우리가 노력해야 합니다.',
      after: '지구라는 하나뿐인 보금자리를 지키기 위한 우리의 작은 실천이 모여 큰 변화를 만들 수 있습니다.'
    }
  };

  return level !== '매우 우수' ? examples[domain] : undefined;
}

// 학생 글쓰기 평가 실행
export async function evaluateStudentWriting(
  student: Student,
  assignmentTitle: string,
  content: string,
  rubricId: string
): Promise<EvaluationResult> {
  const request: AIEvaluationRequest = {
    studentId: student.id,
    studentName: student.name,
    assignmentTitle,
    rubricId,
    content
  };

  const prompt = createEvaluationPrompt(request);
  const aiResponse = await callAIAPI(prompt);

  // AI 응답을 EvaluationResult 형식으로 변환
  const evaluationResult: EvaluationResult = {
    id: `eval-${student.id}-${Date.now()}`,
    student,
    assignmentId: 'assignment-1', // 실제로는 과제 ID 전달 필요
    assignmentTitle,
    evaluatedAt: new Date(),
    overallLevel: aiResponse.overallLevel as EvaluationResult['overallLevel'],
    overallScore: aiResponse.overallScore,
    holisticFeedback: aiResponse.holisticFeedback,
    domainEvaluations: {
      clarity: {
        domain: DOMAIN_MAP.clarity,
        level: aiResponse.domainScores.clarity.level as EvaluationResult['overallLevel'],
        score: aiResponse.domainScores.clarity.score,
        feedback: aiResponse.domainScores.clarity.feedback,
        growthExample: generateGrowthExample('clarity', aiResponse.domainScores.clarity.level)
      },
      validity: {
        domain: DOMAIN_MAP.validity,
        level: aiResponse.domainScores.validity.level as EvaluationResult['overallLevel'],
        score: aiResponse.domainScores.validity.score,
        feedback: aiResponse.domainScores.validity.feedback,
        growthExample: generateGrowthExample('validity', aiResponse.domainScores.validity.level)
      },
      structure: {
        domain: DOMAIN_MAP.structure,
        level: aiResponse.domainScores.structure.level as EvaluationResult['overallLevel'],
        score: aiResponse.domainScores.structure.score,
        feedback: aiResponse.domainScores.structure.feedback,
        growthExample: generateGrowthExample('structure', aiResponse.domainScores.structure.level)
      },
      expression: {
        domain: DOMAIN_MAP.expression,
        level: aiResponse.domainScores.expression.level as EvaluationResult['overallLevel'],
        score: aiResponse.domainScores.expression.score,
        feedback: aiResponse.domainScores.expression.feedback,
        growthExample: generateGrowthExample('expression', aiResponse.domainScores.expression.level)
      }
    },
    aiModel: 'GPT-4'
  };

  return evaluationResult;
}