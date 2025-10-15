import { NextResponse } from 'next/server'
import { getSession } from '@bluenote/supabase-auth/server'
import Anthropic from '@anthropic-ai/sdk'
import JSON5 from 'json5'

// Claude API 키 확인
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

// API 키 확인은 anthropic 클라이언트 생성 시 처리

// Claude API 클라이언트 초기화
const anthropic = apiKey ? new Anthropic({ apiKey }) : null

export async function POST(request) {
  try {
    // 세션 확인
    const session = await getSession()
    
    if (!session?.user?.email) {
      console.log('[generate-questions] No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('[generate-questions] Authenticated user:', session.user.email)

    // API 키 확인
    if (!anthropic) {
      return NextResponse.json({ 
        error: 'AI 서비스가 설정되지 않았습니다. 관리자에게 문의해주세요.',
        details: 'API key not configured'
      }, { status: 500 })
    }

    const { 
      topic, 
      grade, 
      trueFalseCount, 
      multipleChoiceCount,
      difficultyHigh,
      difficultyMedium,
      difficultyLow,
      aiModel 
    } = await request.json()
    
    // 전체 문항 수 및 난이도 합계 검증
    const totalQuestions = trueFalseCount + multipleChoiceCount
    const totalDifficulty = difficultyHigh + difficultyMedium + difficultyLow
    
    // 문항 수와 난이도별 합계가 일치하는지 확인
    if (totalQuestions !== totalDifficulty) {
      return NextResponse.json({ 
        error: `전체 문항 수(${totalQuestions})와 난이도별 문항 수 합계(${totalDifficulty})가 일치하지 않습니다.`
      }, { status: 400 })
    }

    // 학년별 설정
    const gradeMap = {
      elementary3: '초등학교 3학년',
      elementary4: '초등학교 4학년',
      elementary5: '초등학교 5학년',
      elementary6: '초등학교 6학년',
      middle1: '중학교 1학년',
      middle2: '중학교 2학년',
      middle3: '중학교 3학년'
    }
    const gradeLevel = gradeMap[grade] || '중학교 1학년'

    // Claude에게 문항 생성 요청
    const prompt = `당신은 한국의 교육 전문가입니다. ${gradeLevel} 수준에 맞는 Kahoot 퀴즈 문항을 생성해주세요.

주제: ${topic}
총 문항 수: ${totalQuestions}개

문항 유형별 개수:
- OX형 문항: ${trueFalseCount}개
- 4지선다형 문항: ${multipleChoiceCount}개

난이도별 문항 수:
- 상 난이도: ${difficultyHigh}개 (심화 학습, 응용 문제)
- 중 난이도: ${difficultyMedium}개 (기본 개념 이해)
- 하 난이도: ${difficultyLow}개 (기초 개념, 단순 암기)

다음 형식으로 정확히 ${totalQuestions}개의 문항을 JSON 배열로 생성해주세요.
OX형은 options가 2개, 4지선다형은 options가 4개입니다:

[
  {
    "question": "질문 내용",
    "type": "true_false",
    "timeLimit": 20,
    "options": [
      {"text": "O", "isCorrect": true},
      {"text": "X", "isCorrect": false}
    ],
    "explanation": "정답 해설",
    "metadata": {
      "grade": "${grade}",
      "topic": "${topic}",
      "difficulty": "hard"
    }
  }
]

중요한 규칙:
1. 질문은 최대 95자, 선택지는 최대 60자로 제한
2. OX형은 timeLimit 20초, 4지선다형은 30초
3. OX형의 경우 반드시 "O" (맞다)와 "X" (틀리다) 두 개의 선택지만
4. 각 문항마다 정확히 하나의 정답만 있어야 함 (isCorrect: true는 하나만)
5. 해설은 교육적이고 이해하기 쉽게 작성
6. 반드시 지정된 난이도별 문항 수를 정확히 지켜주세요:
   - 난이도 "hard": ${difficultyHigh}개
   - 난이도 "medium": ${difficultyMedium}개
   - 난이도 "easy": ${difficultyLow}개
7. 학년 수준에 맞는 어휘와 개념 사용
8. 문항 유형별 개수도 정확히 지켜주세요
9. **중요**: 순수한 JSON 배열만 응답하세요. 주석, 설명, 코드 블록 마커 등은 절대 포함하지 마세요.
10. **중요**: trailing comma(마지막 항목 뒤 쉼표)를 넣지 마세요.

응답 예시 (주석 없이 순수 JSON만):
[{"question":"예시","type":"true_false","timeLimit":20,"options":[{"text":"O","isCorrect":true},{"text":"X","isCorrect":false}],"explanation":"설명","metadata":{"grade":"${grade}","topic":"${topic}","difficulty":"easy"}}]`

    const response = await anthropic.messages.create({
      model: aiModel, // 사용자가 선택한 모델 사용
      max_tokens: 8000, // 증가: 20문항 생성 시 충분한 토큰
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Claude 응답에서 JSON 추출
    let content = response.content[0].text
    let questions

    // 코드 블록 제거 (가장 먼저 처리)
    const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (codeBlockMatch) {
      console.log('[generate-questions] Removing code block markers')
      content = codeBlockMatch[1].trim()
    }

    try {
      // 먼저 표준 JSON 파싱 시도
      questions = JSON.parse(content)
      console.log('[generate-questions] Successfully parsed with standard JSON')
    } catch (parseError) {
      console.log('[generate-questions] Standard JSON parse failed, trying JSON5...')

      try {
        // JSON5로 파싱 시도 (trailing commas, 주석 등 허용)
        questions = JSON5.parse(content)
        console.log('[generate-questions] Successfully parsed with JSON5')
      } catch (json5Error) {
        console.log('[generate-questions] JSON5 parse failed, extracting JSON array...')

        try {
          // JSON 배열 직접 추출
          const jsonStart = content.indexOf('[')
          const jsonEnd = content.lastIndexOf(']') + 1

          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            console.log('[generate-questions] Extracting JSON array from position', jsonStart, 'to', jsonEnd)
            const jsonString = content.substring(jsonStart, jsonEnd)

            // JSON5로 파싱 (더 관대한 파싱)
            questions = JSON5.parse(jsonString)
            console.log('[generate-questions] Successfully parsed extracted JSON')
          } else {
            console.error('[generate-questions] Could not find JSON array in response')
            console.error('[generate-questions] Response length:', content.length)
            console.error('[generate-questions] Response preview:', content.substring(0, 500))
            throw new Error('Failed to parse AI response - no JSON array found')
          }
        } catch (finalError) {
          console.error('[generate-questions] All parsing attempts failed')
          console.error('[generate-questions] Parse error:', finalError.message)
          console.error('[generate-questions] Response preview:', content.substring(0, 1000))
          throw new Error(`AI 응답 파싱 실패: ${finalError.message}`)
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
    // Anthropic API 에러 처리
    if (error.status === 401) {
      return NextResponse.json({ 
        error: 'API 인증 실패. API 키를 확인해주세요.',
        details: 'Invalid API key'
      }, { status: 500 })
    }
    
    if (error.status === 429) {
      return NextResponse.json({ 
        error: 'API 요청 한도 초과. 잠시 후 다시 시도해주세요.',
        details: 'Rate limit exceeded'
      }, { status: 429 })
    }
    
    if (error.status === 400) {
      return NextResponse.json({ 
        error: '잘못된 요청입니다. 입력 내용을 확인해주세요.',
        details: error.message
      }, { status: 400 })
    }
    
    if (error.message?.includes('api_key')) {
      return NextResponse.json({ 
        error: 'API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.',
        details: 'API key not configured'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: '문항 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}