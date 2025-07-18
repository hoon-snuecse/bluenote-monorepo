import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '',
})

interface EvaluationParams {
  content: string
  rubric: any
  studentName: string
}

interface EvaluationResult {
  domainScores: {
    clarity: number
    validity: number
    structure: number
    expression: number
  }
  domainEvaluations: {
    clarity: { score: number; feedback: string; level: string }
    validity: { score: number; feedback: string; level: string }
    structure: { score: number; feedback: string; level: string }
    expression: { score: number; feedback: string; level: string }
  }
  overallScore: number
  overallLevel: string
  overallFeedback: string
}

export async function evaluateWithClaude({
  content,
  rubric,
  studentName
}: EvaluationParams): Promise<EvaluationResult> {
  try {
    const prompt = `
학생 이름: ${studentName}

평가할 글:
${content}

평가 기준(루브릭):
${JSON.stringify(rubric, null, 2)}

위 글을 다음 4가지 영역에 대해 평가해주세요:
1. 주장의 명확성 (clarity): 핵심 주장이 명확하게 제시되었는가
2. 근거의 타당성 (validity): 주장을 뒷받침하는 근거가 타당한가
3. 논리적 구조 (structure): 글의 구조가 논리적으로 구성되었는가
4. 설득력 있는 표현 (expression): 독자를 설득하는 표현이 효과적인가

각 영역에 대해 0-100점으로 평가하고, 구체적인 피드백을 제공해주세요.

반드시 다음 JSON 형식으로만 응답해주세요:
{
  "domainScores": {
    "clarity": 점수,
    "validity": 점수,
    "structure": 점수,
    "expression": 점수
  },
  "domainEvaluations": {
    "clarity": {
      "score": 점수,
      "feedback": "구체적인 피드백",
      "level": "매우 우수|우수|보통|미흡|매우 미흡"
    },
    "validity": {
      "score": 점수,
      "feedback": "구체적인 피드백",
      "level": "매우 우수|우수|보통|미흡|매우 미흡"
    },
    "structure": {
      "score": 점수,
      "feedback": "구체적인 피드백",
      "level": "매우 우수|우수|보통|미흡|매우 미흡"
    },
    "expression": {
      "score": 점수,
      "feedback": "구체적인 피드백",
      "level": "매우 우수|우수|보통|미흡|매우 미흡"
    }
  },
  "overallScore": 전체평균점수,
  "overallLevel": "매우 우수|우수|보통|미흡|매우 미흡",
  "overallFeedback": "전체적인 종합 피드백"
}
`

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''

    // JSON 파싱
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.')
    }

    const evaluation = JSON.parse(jsonMatch[0])
    
    // 검증
    if (!evaluation.domainScores || !evaluation.domainEvaluations) {
      throw new Error('평가 결과가 올바른 형식이 아닙니다.')
    }

    return evaluation as EvaluationResult
  } catch (error) {
    console.error('AI 평가 오류:', error)
    
    // 오류 시 기본값 반환
    return {
      domainScores: {
        clarity: 70,
        validity: 70,
        structure: 70,
        expression: 70
      },
      domainEvaluations: {
        clarity: { score: 70, feedback: '평가 중 오류가 발생했습니다.', level: '보통' },
        validity: { score: 70, feedback: '평가 중 오류가 발생했습니다.', level: '보통' },
        structure: { score: 70, feedback: '평가 중 오류가 발생했습니다.', level: '보통' },
        expression: { score: 70, feedback: '평가 중 오류가 발생했습니다.', level: '보통' }
      },
      overallScore: 70,
      overallLevel: '보통',
      overallFeedback: '평가 중 오류가 발생했습니다. 다시 시도해주세요.'
    }
  }
}