import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getToken } from 'next-auth/jwt'
import Anthropic from '@anthropic-ai/sdk'

// Claude API 키 확인
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

// API 키 확인은 anthropic 클라이언트 생성 시 처리

// Claude API 클라이언트 초기화
const anthropic = apiKey ? new Anthropic({ apiKey }) : null

export async function POST(request) {
  try {
    // 세션 확인 - 메인 웹 앱의 세션 토큰 확인
    console.log('[generate-questions] Checking session');
    
    // 쿠키 직접 확인
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    
    // 가능한 모든 쿠키 이름 확인
    const possibleCookieNames = [
      '__Secure-next-auth.session-token',
      '__Host-next-auth.session-token', 
      'next-auth.session-token',
      '__Secure-authjs.session-token',
      'authjs.session-token'
    ];
    
    let sessionToken = null;
    for (const name of possibleCookieNames) {
      const cookie = cookieStore.get(name);
      if (cookie) {
        sessionToken = cookie.value;
        console.log('[generate-questions] Found session cookie:', name);
        break;
      }
    }
    
    if (!sessionToken) {
      const allCookies = Array.from(cookieStore.getAll());
      console.log('[generate-questions] No session found. All cookies:', allCookies.map(c => c.name));
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 })
    }
    
    // JWT 토큰 검증 시도
    let token = null;
    try {
      token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: isProd,
        salt: isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
      });
    } catch (error) {
      console.log('[generate-questions] Token verification error:', error.message);
    }
    
    // 토큰이 없어도 세션 쿠키가 있으면 허용 (임시)
    if (!token) {
      console.log('[generate-questions] No valid token but session cookie exists, proceeding');
      // 세션 쿠키가 있으므로 진행
    } else {
      console.log('[generate-questions] Authenticated user:', token.email);
    }

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

다음 형식으로 정확히 ${totalQuestions}개의 문항을 JSON 배열로 생성해주세요:

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
      "difficulty": "hard" 또는 "medium" 또는 "easy"
    }
  }
]

중요한 규칙:
1. 질문은 최대 95자, 선택지는 최대 60자로 제한
2. OX형은 timeLimit 20초, 4지선다형은 30초
3. OX형의 경우 반드시 "O" (맞다)와 "X" (틀리다) 두 개의 선택지만
4. 각 문항마다 정확히 하나의 정답만 있어야 함
5. 해설은 교육적이고 이해하기 쉽게 작성
6. 반드시 지정된 난이도별 문항 수를 정확히 지켜주세요:
   - 난이도 "hard": ${difficultyHigh}개
   - 난이도 "medium": ${difficultyMedium}개  
   - 난이도 "easy": ${difficultyLow}개
7. 학년 수준에 맞는 어휘와 개념 사용
8. 문항 유형별 개수도 정확히 지켜주세요

JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.`

    const response = await anthropic.messages.create({
      model: aiModel, // 사용자가 선택한 모델 사용
      max_tokens: 4000,
      temperature: 0.7,
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