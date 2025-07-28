import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Anthropic from '@anthropic-ai/sdk'

// Claude API 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
})

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topic, grade, questionCount, trueFalseRatio } = await request.json()

    // 학년별 난이도 설정
    const gradeLevel = {
      elementary: '초등학생',
      middle: '중학생',
      high: '고등학생',
      general: '일반'
    }[grade] || '일반'

    // OX형과 4지선다형 문항 수 계산
    const trueFalseCount = Math.round((questionCount * trueFalseRatio) / 100)
    const multipleChoiceCount = questionCount - trueFalseCount

    // Claude에게 문항 생성 요청
    const prompt = `당신은 한국의 교육 전문가입니다. ${gradeLevel} 수준에 맞는 Kahoot 퀴즈 문항을 생성해주세요.

주제: ${topic}
총 문항 수: ${questionCount}개
- OX형 문항: ${trueFalseCount}개
- 4지선다형 문항: ${multipleChoiceCount}개

다음 형식으로 정확히 ${questionCount}개의 문항을 JSON 배열로 생성해주세요:

[
  {
    "question": "질문 내용 (최대 95자)",
    "type": "true_false" 또는 "multiple_choice",
    "timeLimit": 20 또는 30,
    "options": [
      {"text": "선택지 1 (최대 60자)", "isCorrect": true/false},
      {"text": "선택지 2 (최대 60자)", "isCorrect": true/false},
      // 4지선다형은 4개, OX형은 2개
    ],
    "explanation": "정답 해설",
    "metadata": {
      "grade": "${grade}",
      "topic": "${topic}",
      "difficulty": "easy/medium/hard"
    }
  }
]

중요한 규칙:
1. 질문은 최대 95자, 선택지는 최대 60자로 제한
2. OX형은 timeLimit 20초, 4지선다형은 30초
3. OX형의 경우 반드시 "O" (맞다)와 "X" (틀리다) 두 개의 선택지만
4. 각 문항마다 정확히 하나의 정답만 있어야 함
5. 해설은 교육적이고 이해하기 쉽게 작성
6. 다양한 난이도로 골고루 분포
7. 학년 수준에 맞는 어휘와 개념 사용

JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Claude 응답에서 JSON 추출
    const content = response.content[0].text
    let questions
    
    try {
      // JSON 파싱 시도
      questions = JSON.parse(content)
    } catch (parseError) {
      // JSON이 코드 블록으로 감싸진 경우 처리
      const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[1])
      } else {
        // 직접 JSON 찾기
        const jsonStart = content.indexOf('[')
        const jsonEnd = content.lastIndexOf(']') + 1
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          questions = JSON.parse(content.substring(jsonStart, jsonEnd))
        } else {
          throw new Error('Failed to parse AI response')
        }
      }
    }

    // 응답 검증 및 정규화
    const normalizedQuestions = questions.map((q, index) => ({
      question: q.question.substring(0, 95),
      type: q.type,
      timeLimit: q.timeLimit || (q.type === 'true_false' ? 20 : 30),
      points: 1000,
      options: q.options.map(opt => ({
        text: opt.text.substring(0, 60),
        isCorrect: opt.isCorrect
      })),
      explanation: q.explanation || '',
      metadata: {
        ...q.metadata,
        order: index
      }
    }))

    return NextResponse.json({ 
      questions: normalizedQuestions,
      message: '문항이 성공적으로 생성되었습니다.'
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    
    if (error.message?.includes('api_key')) {
      return NextResponse.json({ 
        error: 'API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: '문항 생성 중 오류가 발생했습니다. 다시 시도해주세요.' 
    }, { status: 500 })
  }
}