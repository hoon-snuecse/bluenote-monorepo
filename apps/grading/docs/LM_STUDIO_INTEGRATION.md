# LM Studio 및 OSS GPT-20B 통합 가이드

## 개요

이 문서는 Grading System에 LM Studio를 통해 오픈소스 대규모 언어 모델(OSS GPT-20B)을 통합하는 방법을 설명합니다. 이를 통해 Claude API 대신 로컬 또는 자체 호스팅된 AI 모델을 사용하여 학생 평가를 수행할 수 있습니다.

## 목차

1. [LM Studio 설치 및 설정](#lm-studio-설치-및-설정)
2. [OSS GPT-20B 모델 다운로드](#oss-gpt-20b-모델-다운로드)
3. [환경 변수 설정](#환경-변수-설정)
4. [코드 구조 및 동작 방식](#코드-구조-및-동작-방식)
5. [API 사용 방법](#api-사용-방법)
6. [UI에서 사용하기](#ui에서-사용하기)
7. [문제 해결](#문제-해결)
8. [성능 최적화](#성능-최적화)

## LM Studio 설치 및 설정

### 1. LM Studio 다운로드

1. [LM Studio 공식 웹사이트](https://lmstudio.ai/)에서 운영체제에 맞는 버전 다운로드
2. 설치 프로그램 실행 및 설치 완료

### 2. LM Studio 실행 및 초기 설정

```bash
# macOS/Linux
open /Applications/LM\ Studio.app

# Windows
# 시작 메뉴에서 LM Studio 실행
```

### 3. 서버 모드 활성화

1. LM Studio 실행
2. 상단 메뉴에서 "Local Server" 탭 선택
3. "Start Server" 버튼 클릭
4. 기본 포트: `http://localhost:1234/v1`

## OSS GPT-20B 모델 다운로드

### 1. 모델 검색 및 다운로드

LM Studio 내에서:
1. "Discover" 탭으로 이동
2. 검색창에 "gpt" 또는 "20b" 입력
3. 호환 가능한 모델 선택 (예: `TheBloke/GPT-NeoXT-Chat-Base-20B-GGUF`)
4. "Download" 클릭

### 2. 모델 로드

1. "My Models" 탭으로 이동
2. 다운로드된 모델 선택
3. "Load" 버튼 클릭
4. 로딩 완료 확인 (RAM 사용량 확인)

**주의사항:**
- GPT-20B 모델은 약 40GB의 디스크 공간 필요
- 실행 시 최소 32GB RAM 권장
- GPU 가속을 위해 CUDA 또는 Metal 지원 필요

## 환경 변수 설정

### `.env.local` 파일 설정

```bash
# LM Studio Configuration
LM_STUDIO_ENABLED="true"
LM_STUDIO_URL="http://localhost:1234/v1"

# 기존 Claude API는 백업으로 유지
ANTHROPIC_API_KEY="your-key-here"
CLAUDE_API_KEY="your-key-here"
```

### 환경 변수 설명

- `LM_STUDIO_ENABLED`: LM Studio 사용 여부 (`true`/`false`)
- `LM_STUDIO_URL`: LM Studio 서버 주소 (기본값: `http://localhost:1234/v1`)

## 코드 구조 및 동작 방식

### 1. 주요 파일 구조

```
src/
├── lib/
│   ├── lm-studio-api.ts      # LM Studio API 클라이언트
│   ├── ai-evaluator.ts       # AI 평가 통합 모듈
│   └── claude-api.ts          # Claude API (백업용)
├── app/
│   └── api/
│       ├── evaluate/route.ts # 평가 API 엔드포인트
│       └── test-lm-studio/route.ts # 테스트 엔드포인트
```

### 2. LM Studio API 클라이언트 (`lm-studio-api.ts`)

```typescript
// OpenAI 호환 API 사용
import OpenAI from 'openai';

const lmStudioClient = new OpenAI({
  baseURL: LM_STUDIO_URL,
  apiKey: 'not-needed', // LM Studio는 API 키 불필요
});

// 주요 함수
export async function evaluateWithLMStudio(request: LMStudioEvaluationRequest) {
  // 1. 시스템 프롬프트 구성
  // 2. API 호출
  // 3. 응답 파싱 및 검증
  // 4. 결과 반환
}
```

### 3. AI 평가자 통합 (`ai-evaluator.ts`)

```typescript
// 자동 폴백 메커니즘
async function evaluate() {
  // 1. LM Studio 사용 가능 확인
  if (LM_STUDIO_ENABLED) {
    try {
      return await evaluateWithLMStudio(request);
    } catch (error) {
      // 자동으로 Claude API로 폴백
    }
  }
  
  // 2. Claude API 사용
  return await evaluateWithClaude(request);
}
```

## API 사용 방법

### 1. 평가 API 호출

```javascript
// POST /api/evaluate
const response = await fetch('/api/evaluate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    assignmentId: 'assignment-id',
    submissions: [
      {
        studentName: '김민준',
        studentId: 'student-001',
        content: '학생이 작성한 글 내용...'
      }
    ],
    evaluationModel: 'lm-studio', // 또는 'claude'
    temperature: 0.1, // 선택사항 (0-1)
    outputFormat: '...', // 선택사항
  })
});
```

### 2. 서버 상태 확인

```javascript
// GET /api/test-lm-studio
const response = await fetch('/api/test-lm-studio');
const data = await response.json();
// {
//   available: true,
//   models: ['openai/gpt-oss-20b'],
//   testResult: { ... }
// }
```

## UI에서 사용하기

### 1. 평가 페이지에서 모델 선택

평가 페이지(`/assignments/[id]/evaluate`)에서:

1. **AI 모델 선택** 드롭다운 메뉴
   - Claude (Anthropic) - 클라우드 기반
   - OSS GPT (로컬) - LM Studio

2. **Temperature 설정**
   - 슬라이더: 0.0 ~ 1.0
   - 권장값: 0.1 ~ 0.3 (일관된 평가)

3. **평가 실행**
   - "평가 시작" 버튼 클릭
   - 실시간 진행 상황 표시

### 2. 출력 형식 지정

과제 편집 페이지에서 커스텀 JSON 형식 지정 가능:

```json
{
  "overallScore": "점수 (0-100)",
  "overallGrade": "전체 평가 수준",
  "domainScores": { "영역명": "점수" },
  "domainGrades": { "영역명": "평가 수준" },
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "detailedFeedback": "상세 피드백"
}
```

## 문제 해결

### 1. LM Studio 연결 실패

**증상:**
```
LM Studio 서버 연결 실패: FetchError: fetch failed
```

**해결 방법:**
1. LM Studio가 실행 중인지 확인
2. Local Server가 활성화되어 있는지 확인
3. 포트 1234가 사용 가능한지 확인
   ```bash
   lsof -i :1234  # macOS/Linux
   netstat -an | findstr :1234  # Windows
   ```

### 2. 모델 로딩 실패

**증상:**
```
No models loaded in LM Studio
```

**해결 방법:**
1. LM Studio에서 모델 다운로드 완료 확인
2. "My Models" 탭에서 모델 로드
3. 충분한 RAM 확보 (최소 32GB)

### 3. 평가 응답 파싱 실패

**증상:**
```
LM Studio 응답 파싱 실패: SyntaxError
```

**해결 방법:**
1. Temperature 낮추기 (0.1 이하)
2. 출력 형식 프롬프트 명확히 지정
3. 폴백 메커니즘 활용 (자동으로 Claude API 사용)

### 4. 메모리 부족

**증상:**
```
Out of memory error
```

**해결 방법:**
1. 더 작은 모델 사용 (예: 7B, 13B 모델)
2. 양자화된(Quantized) 모델 사용 (GGUF Q4_K_M)
3. GPU 오프로딩 설정 조정

## 성능 최적화

### 1. 모델 선택 가이드

| 모델 크기 | RAM 요구사항 | 성능 | 추천 사용 사례 |
|----------|-------------|------|--------------|
| 7B | 8GB+ | 빠름 | 간단한 평가, 테스트 |
| 13B | 16GB+ | 균형 | 일반적인 평가 |
| 20B | 32GB+ | 정확 | 상세한 평가, 프로덕션 |

### 2. 배치 처리 최적화

```typescript
// 동시 처리 제한
const BATCH_SIZE = 5;
const results = [];

for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
  const batch = submissions.slice(i, i + BATCH_SIZE);
  const batchResults = await Promise.all(
    batch.map(s => evaluateWithLMStudio(s))
  );
  results.push(...batchResults);
}
```

### 3. 캐싱 전략

- 동일한 과제와 학생 글에 대한 평가 결과 캐싱
- Redis 또는 메모리 캐시 활용
- TTL: 24시간 권장

## 보안 고려사항

1. **로컬 전용 모드**
   - LM Studio는 기본적으로 localhost에서만 접근 가능
   - 프로덕션 환경에서는 리버스 프록시 사용 권장

2. **데이터 프라이버시**
   - 모든 평가 데이터가 로컬에서 처리됨
   - 외부 API로 데이터 전송 없음
   - GDPR/개인정보보호 규정 준수 용이

3. **액세스 제어**
   - 환경 변수로 LM Studio 활성화/비활성화
   - 관리자만 모델 선택 가능하도록 제한 가능

## 향후 개선 사항

1. **다중 모델 지원**
   - 과제 유형별 최적 모델 자동 선택
   - A/B 테스팅을 통한 모델 성능 비교

2. **파인튜닝**
   - 한국어 교육 데이터로 모델 파인튜닝
   - 학교별/학년별 맞춤형 평가 모델

3. **모니터링**
   - 평가 소요 시간 추적
   - 모델 성능 메트릭 수집
   - 오류율 및 폴백 빈도 모니터링

## 참고 자료

- [LM Studio 공식 문서](https://lmstudio.ai/docs)
- [OpenAI API 호환성 가이드](https://platform.openai.com/docs/api-reference)
- [GGUF 모델 형식 설명](https://github.com/ggerganov/llama.cpp)
- [Hugging Face 모델 허브](https://huggingface.co/models)

---

작성일: 2025-09-03
최종 수정일: 2025-09-03
작성자: Grading System 개발팀