# 📚 Bluenote Quiz AI 문항 생성 시스템 기술 문서

## 📋 목차

1. [개요](#개요)
2. [프롬프트 위치](#프롬프트-위치)
3. [프롬프트 구조](#프롬프트-구조)
   - [역할 정의](#1-역할-정의)
   - [기본 정보](#2-기본-정보)
   - [문항 유형별 분배](#3-문항-유형별-분배)
   - [난이도별 분배](#4-난이도별-분배)
   - [JSON 출력 형식](#5-json-출력-형식)
   - [제약 조건](#6-제약-조건)
4. [프롬프트 변수 설명](#프롬프트-변수-설명)
5. [학년 매핑](#학년-매핑)
6. [AI 모델 선택](#ai-모델-선택)
7. [프롬프트 전달 과정](#프롬프트-전달-과정)
8. [AI 응답 처리](#ai-응답-처리)
   - [응답 수신](#응답-수신)
   - [JSON 파싱](#json-파싱)
   - [데이터 정규화](#데이터-정규화)
9. [에러 처리](#에러-처리)
10. [검증 로직](#검증-로직)
11. [주의사항](#주의사항)
12. [업데이트 이력](#업데이트-이력)

## 개요

이 문서는 Bluenote Quiz 앱에서 Claude AI를 사용하여 교육용 퀴즈 문항을 생성할 때 사용되는 프롬프트의 구조와 작동 방식을 상세히 설명합니다. 교사들이 AI의 도움을 받아 Kahoot 호환 퀴즈를 생성하는 전체 프로세스를 다룹니다.

## 프롬프트 위치

- **파일**: `/apps/quiz/src/app/api/ai/generate-questions/route.js`
- **변수명**: `prompt`
- **시작 라인**: 76번 줄

## 프롬프트 구조

### 1. 역할 정의
```
당신은 한국의 교육 전문가입니다. ${gradeLevel} 수준에 맞는 Kahoot 퀴즈 문항을 생성해주세요.
```
- AI에게 한국 교육 전문가의 역할 부여
- 특정 학년 수준에 맞는 문항 생성 요구

### 2. 기본 정보
```
주제: ${topic}
총 문항 수: ${totalQuestions}개
```
- 사용자가 입력한 주제
- 생성할 전체 문항 수

### 3. 문항 유형별 분배
```
문항 유형별 개수:
- OX형 문항: ${trueFalseCount}개
- 4지선다형 문항: ${multipleChoiceCount}개
```
- OX형: 참/거짓 판단 문항
- 4지선다형: 4개 선택지 중 1개 정답

### 4. 난이도별 분배
```
난이도별 문항 수:
- 상 난이도: ${difficultyHigh}개 (심화 학습, 응용 문제)
- 중 난이도: ${difficultyMedium}개 (기본 개념 이해)
- 하 난이도: ${difficultyLow}개 (기초 개념, 단순 암기)
```
- 각 난이도별 특성 명시
- 난이도별 문항 수 지정

### 5. JSON 출력 형식
```json
[
  {
    "question": "질문 내용 (최대 95자)",
    "type": "true_false" 또는 "multiple_choice",
    "timeLimit": 20 또는 30,
    "options": [
      {"text": "선택지 1 (최대 60자)", "isCorrect": true/false},
      {"text": "선택지 2 (최대 60자)", "isCorrect": true/false}
    ],
    "explanation": "정답 해설",
    "metadata": {
      "grade": "${grade}",
      "topic": "${topic}",
      "difficulty": "hard" 또는 "medium" 또는 "easy"
    }
  }
]
```

### 6. 제약 조건
1. **글자 수 제한**
   - 질문: 최대 95자
   - 선택지: 최대 60자

2. **시간 제한**
   - OX형: 20초
   - 4지선다형: 30초

3. **선택지 규칙**
   - OX형: 반드시 "O" (맞다)와 "X" (틀리다) 2개
   - 4지선다형: 4개 선택지
   - 각 문항당 정답은 1개만

4. **품질 요구사항**
   - 교육적이고 이해하기 쉬운 해설
   - 학년 수준에 맞는 어휘와 개념 사용

5. **수량 준수**
   - 지정된 난이도별 문항 수 정확히 준수
   - 문항 유형별 개수 정확히 준수

## 프롬프트 변수 설명

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `${gradeLevel}` | 대상 학년 (한글) | "중학교 1학년" |
| `${topic}` | 퀴즈 주제 | "조선시대 역사" |
| `${totalQuestions}` | 전체 문항 수 | 10 |
| `${trueFalseCount}` | OX형 문항 수 | 3 |
| `${multipleChoiceCount}` | 4지선다형 문항 수 | 7 |
| `${difficultyHigh}` | 상 난이도 문항 수 | 2 |
| `${difficultyMedium}` | 중 난이도 문항 수 | 6 |
| `${difficultyLow}` | 하 난이도 문항 수 | 2 |
| `${grade}` | 학년 코드 | "middle1" |

## 학년 매핑

| 코드 | 한글 표시 |
|------|-----------|
| elementary3 | 초등학교 3학년 |
| elementary4 | 초등학교 4학년 |
| elementary5 | 초등학교 5학년 |
| elementary6 | 초등학교 6학년 |
| middle1 | 중학교 1학년 |
| middle2 | 중학교 2학년 |
| middle3 | 중학교 3학년 |

## AI 모델 선택

사용자가 선택한 AI 모델이 `aiModel` 변수를 통해 전달됩니다:
- Claude Sonnet 4: `claude-sonnet-4-20250514` (기본값)
- Claude Opus 4: `claude-opus-4-20250514`

## 프롬프트 전달 과정

1. 사용자가 QuizBuilder 컴포넌트에서 정보 입력
2. `/api/ai/generate-questions` 엔드포인트로 POST 요청
3. `prompt` 변수에 프롬프트 문자열 생성
4. Claude API의 `messages.create()` 메서드 호출
5. `content` 필드에 프롬프트 전달

```javascript
const response = await anthropic.messages.create({
  model: aiModel,
  max_tokens: 4000,
  temperature: 0.7,
  messages: [
    {
      role: 'user',
      content: prompt  // 프롬프트 전달
    }
  ]
})
```

## AI 응답 처리

### 응답 수신

Claude API로부터 응답을 받는 주요 변수와 과정:

```javascript
const response = await anthropic.messages.create({
  model: aiModel,
  max_tokens: 4000,
  temperature: 0.7,
  messages: [{ role: 'user', content: prompt }]
})
```

**주요 변수**:
- `response`: Claude API의 응답 객체
- `response.content[0].text`: 실제 AI가 생성한 텍스트 내용

### JSON 파싱

AI 응답은 다양한 형태로 올 수 있으므로 유연한 파싱 전략을 사용합니다:

```javascript
const content = response.content[0].text
let questions

try {
  // 1차 시도: 직접 JSON 파싱
  questions = JSON.parse(content)
} catch (parseError) {
  // 2차 시도: 코드 블록으로 감싸진 경우
  const jsonMatch = content.match(/```json?\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    questions = JSON.parse(jsonMatch[1])
  } else {
    // 3차 시도: JSON 배열 직접 추출
    const jsonStart = content.indexOf('[')
    const jsonEnd = content.lastIndexOf(']') + 1
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      questions = JSON.parse(content.substring(jsonStart, jsonEnd))
    } else {
      throw new Error('Failed to parse AI response')
    }
  }
}
```

**파싱 전략**:
1. **직접 파싱**: AI가 순수 JSON만 반환한 경우
2. **코드 블록 추출**: \`\`\`json 형태로 감싸진 경우
3. **배열 추출**: 텍스트 중간에 JSON 배열이 포함된 경우

### 데이터 정규화

파싱된 데이터를 Kahoot 형식에 맞게 정규화합니다:

```javascript
const normalizedQuestions = questions.map((q, index) => ({
  question: q.question.substring(0, 95),      // 최대 95자 제한
  type: q.type,
  timeLimit: q.timeLimit || (q.type === 'true_false' ? 20 : 30),
  points: 1000,                               // 고정 점수
  options: q.options.map(opt => ({
    text: opt.text.substring(0, 60),          // 최대 60자 제한
    isCorrect: opt.isCorrect
  })),
  explanation: q.explanation || '',
  metadata: {
    ...q.metadata,
    order: index                              // 순서 추가
  }
}))
```

**정규화 항목**:
- **질문 길이**: 95자로 자동 절단
- **선택지 길이**: 60자로 자동 절단
- **시간 제한**: 기본값 적용 (OX형 20초, 4지선다 30초)
- **점수**: 1000점 고정
- **순서**: 인덱스 자동 추가

## 에러 처리

### API 에러 처리

```javascript
try {
  const response = await anthropic.messages.create(...)
} catch (error) {
  console.error('Claude API error:', error)
  
  if (error.message?.includes('API key')) {
    return NextResponse.json({
      error: 'Claude API 키가 설정되지 않았습니다.'
    }, { status: 500 })
  }
  
  return NextResponse.json({
    error: 'AI 문항 생성 중 오류가 발생했습니다.',
    details: error.message
  }, { status: 500 })
}
```

### 파싱 에러 처리

- JSON 파싱 실패 시 3단계 폴백 전략 적용
- 모든 시도 실패 시 명확한 에러 메시지 반환

### 검증 에러 처리

- 난이도별 문항 수 합계 불일치 시 400 에러
- 필수 필드 누락 시 400 에러

## 검증 로직

프롬프트 생성 전에 다음 검증이 수행됩니다:
- 전체 문항 수와 난이도별 문항 수 합계가 일치하는지 확인
- 불일치 시 400 에러 반환

## 주의사항

1. **JSON 형식 준수**: AI는 반드시 JSON 형식으로만 응답해야 함
2. **Kahoot 제약사항**: Kahoot 플랫폼의 글자 수 제한 준수 필수
3. **한국어 컨텍스트**: 한국 교육 과정에 맞는 내용 생성
4. **정확한 수량**: 요청된 문항 수와 난이도 분배를 정확히 지켜야 함

## 업데이트 이력

- 2024년 1월: 초기 버전 생성
- 2024년 1월: 개별 학년 선택 기능 추가
- 2024년 1월: 난이도별 문항 수 직접 입력 기능 추가
- 2024년 1월: AI 모델 선택 기능 추가