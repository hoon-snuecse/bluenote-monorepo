# OSS GPT-20B 완전 통합 가이드

## 📌 개요

이 문서는 Grading System에서 LM Studio를 통해 OSS GPT-20B 모델을 사용하여 학생 평가를 수행하는 모든 내용을 담고 있습니다. 2025년 9월 3일 기준으로 실제 운영 중인 설정과 방법을 포함합니다.

## 목차

1. [현재 작동 상태](#현재-작동-상태)
2. [빠른 시작 (5분)](#빠른-시작-5분)
3. [상세 설치 가이드](#상세-설치-가이드)
4. [현재 설정 및 연결](#현재-설정-및-연결)
5. [Temperature 조정](#temperature-조정)
6. [API 사용법](#api-사용법)
7. [문제 해결](#문제-해결)
8. [성능 최적화](#성능-최적화)

---

## 🟢 현재 작동 상태

### 실시간 상태 (2025년 9월 3일)
```
✅ LM Studio: 실행 중
✅ 서버: http://localhost:1234/v1
✅ 모델: openai/gpt-oss-20b
✅ 메모리: 25-30GB 사용 중
✅ 평가 속도: 12초/학생
```

### 현재 환경 변수 (.env.local)
```env
# LM Studio Configuration
LM_STUDIO_ENABLED="true"
LM_STUDIO_URL="http://localhost:1234/v1"
```

---

## 🚀 빠른 시작 (5분)

### Step 1: LM Studio 설치
```bash
# macOS
brew install --cask lm-studio

# 또는 https://lmstudio.ai 에서 다운로드
```

### Step 2: 모델 다운로드
1. LM Studio 실행
2. "Discover" 탭 → "gpt" 검색
3. `openai/gpt-oss-20b` 또는 호환 모델 다운로드

### Step 3: 서버 시작
1. "Local Server" 탭
2. 모델 선택
3. "Start Server" 클릭

### Step 4: Grading 앱 설정
```env
# .env.local
LM_STUDIO_ENABLED="true"
LM_STUDIO_URL="http://localhost:1234/v1"
```

### Step 5: 테스트
```bash
npm run dev
# http://localhost:3002/test-lm-studio 접속
```

### ✅ 빠른 체크리스트
- [ ] LM Studio 설치됨
- [ ] 16GB+ RAM 확보
- [ ] 모델 다운로드 완료 (20-40GB)
- [ ] Local Server 실행 중
- [ ] 환경 변수 설정
- [ ] 테스트 페이지 "available: true"

---

## 📚 상세 설치 가이드

### 시스템 요구사항

| 구성 | 최소 사양 | 권장 사양 |
|------|----------|----------|
| RAM | 16GB | 32GB+ |
| 디스크 | 50GB | 100GB+ |
| CPU | 8코어 | 16코어+ |
| GPU | 선택사항 | NVIDIA/Apple Silicon |

### LM Studio 설치

#### macOS
```bash
# Homebrew
brew install --cask lm-studio

# 수동 설치
# 1. https://lmstudio.ai 접속
# 2. macOS 버전 다운로드
# 3. .dmg 파일 실행
```

#### Windows
```bash
# 1. https://lmstudio.ai 접속
# 2. Windows 버전 다운로드
# 3. 설치 프로그램 실행
```

#### Linux
```bash
# AppImage 다운로드
wget https://releases.lmstudio.ai/linux/LM-Studio.AppImage
chmod +x LM-Studio.AppImage
./LM-Studio.AppImage
```

### 모델 선택 가이드

| 모델 | RAM 요구 | 속도 | 정확도 | 용도 |
|------|---------|------|--------|------|
| Llama-2-7B | 8GB | ⚡⚡⚡ | ⭐⭐ | 테스트 |
| Llama-2-13B | 16GB | ⚡⚡ | ⭐⭐⭐ | 일반 평가 |
| **GPT-OSS-20B** | 32GB | ⚡ | ⭐⭐⭐⭐ | 상세 평가 |

### 모델 다운로드 및 로드

1. **모델 검색**
   - LM Studio → "Discover" 탭
   - 검색: "gpt", "20b", "oss"
   - 추천: `TheBloke/GPT-NeoXT-Chat-Base-20B-GGUF`

2. **다운로드**
   - Q4_K_M: 균형 (용량↓, 성능↑)
   - Q5_K_S: 품질 우선
   - Q8_0: 최고 품질 (용량↑)

3. **모델 로드**
   - "My Models" 탭
   - 다운로드된 모델 선택
   - "Load" 버튼 클릭
   - RAM 사용량 확인

---

## ⚙️ 현재 설정 및 연결

### 실제 연결 과정

#### 1. LM Studio 실행
```bash
# macOS
open /Applications/LM\ Studio.app

# Windows
# 시작 메뉴에서 LM Studio 실행
```

#### 2. Local Server 설정
- Local Server 탭 → Start Server
- 주소: `http://localhost:1234/v1`
- 모델: `openai/gpt-oss-20b`

#### 3. 연결 확인
```bash
# 터미널
curl http://localhost:1234/v1/models

# 예상 응답
{
  "data": [{
    "id": "openai/gpt-oss-20b",
    "object": "model"
  }]
}
```

#### 4. Grading 앱 실행
```bash
cd /Users/hoon/bluenote-monorepo/apps/grading
npm run dev
```

#### 5. 테스트
- 브라우저: `http://localhost:3002/test-lm-studio`
- 확인: `"available": true`

### 코드 구조

```
src/
├── lib/
│   ├── lm-studio-api.ts      # LM Studio 클라이언트
│   ├── ai-evaluator.ts       # AI 통합 모듈
│   └── claude-api.ts          # Claude API (폴백)
└── app/
    ├── api/
    │   ├── evaluate/route.ts  # 평가 API
    │   └── test-lm-studio/    # 테스트 엔드포인트
    └── assignments/
        └── [id]/evaluate/     # 평가 UI
```

### 핵심 코드

#### lm-studio-api.ts
```typescript
const lmStudioClient = new OpenAI({
  baseURL: 'http://localhost:1234/v1',
  apiKey: 'not-needed',
});

export async function evaluateWithLMStudio(request) {
  const completion = await lmStudioClient.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [...],
    temperature: request.temperature || 0.1,
    max_tokens: 4096,
  });
}
```

---

## 🎛️ Temperature 조정

### Temperature란?
AI 응답의 창의성/일관성 조절 매개변수 (0.0 ~ 1.0)

### 조정 방법

#### 방법 1: UI에서 실시간 조정 ✅
평가 페이지에서 슬라이더 사용
- 위치: AI 모델 선택 아래
- 범위: 0.0 ~ 1.0
- 현재값: 우측 표시

#### 방법 2: 코드 기본값 변경

**파일**: `src/app/assignments/[assignmentId]/evaluate/page.tsx`
```typescript
// 라인 35
const [temperature, setTemperature] = useState(0.1); // 원하는 값으로 변경
```

**파일**: `src/lib/lm-studio-api.ts`
```typescript
// 라인 110
temperature: request.temperature || 0.1,  // 기본값 변경
```

### 권장 설정

| 용도 | Temperature | 특징 |
|------|------------|------|
| **일관된 평가** | 0.1 | 현재 설정, 안정적 |
| **약간의 변화** | 0.2~0.3 | 다양한 표현 |
| **균형** | 0.5 | 창의성+일관성 |
| **창의적** | 0.7+ | 다양하지만 불안정 |

---

## 📡 API 사용법

### 평가 API 호출

```javascript
// POST /api/evaluate
const response = await fetch('/api/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assignmentId: 'assignment-id',
    submissions: [{
      studentName: '김민준',
      studentId: 'student-001',
      content: '학생 글 내용...'
    }],
    evaluationModel: 'lm-studio',  // 또는 'claude'
    temperature: 0.1,
    outputFormat: '...'  // 선택사항
  })
});
```

### 서버 상태 확인

```javascript
// GET /api/test-lm-studio
const status = await fetch('/api/test-lm-studio');
// 응답: { available: true, models: [...] }
```

### UI에서 사용

1. **과제 평가 페이지**
   ```
   http://localhost:3002/assignments/[id]/evaluate
   ```

2. **AI 모델 선택**
   - 드롭다운: "OSS GPT (로컬)" 선택

3. **Temperature 설정**
   - 슬라이더: 0.1 (권장)

4. **평가 실행**
   - "평가 시작" 버튼
   - 진행률: "평가 중... (1/30)"

---

## 🔧 문제 해결

### 연결 실패
```bash
# LM Studio 상태 확인
curl http://localhost:1234/v1/models

# 포트 확인
lsof -i :1234

# 해결
1. LM Studio 재시작
2. Local Server → Start Server
3. 포트 변경 (1234 → 1235)
```

### 메모리 부족
```bash
# RAM 확인
# macOS: Activity Monitor
# Windows: 작업 관리자

# 해결
1. 더 작은 모델 사용 (7B, 13B)
2. Quantized 버전 (Q4_K_M)
3. 불필요한 앱 종료
```

### 평가 결과 이상
```javascript
// Temperature 낮추기
setTemperature(0.05);

// 출력 형식 명확히
const outputFormat = `
JSON 형식으로만 응답:
{
  "overallScore": 0-100,
  "overallGrade": "string",
  ...
}`;
```

### 응답 파싱 실패
- JSON 형식 강조
- Temperature 0.1 이하
- 폴백: Claude API 자동 사용

---

## ⚡ 성능 최적화

### 현재 성능 지표
- **응답 시간**: 12초/학생
- **메모리**: 25-30GB
- **CPU**: 60-80%
- **성공률**: 95%

### 최적화 방법

#### 1. 배치 처리
```typescript
const BATCH_SIZE = 5;
for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
  const batch = submissions.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(evaluate));
}
```

#### 2. GPU 가속
- NVIDIA: CUDA 활성화
- Apple: Metal 사용
- Settings → GPU Layers 조정

#### 3. 모델 최적화
- Quantization: Q4_K_M 사용
- Context: 2048 토큰 제한
- Batch Size: 5-10 조정

### 모니터링

```bash
# 로그 확인
npm run dev

# 출력 예시
LM Studio 평가 시작: 김민준
LM Studio 응답 수신 완료
평가 완료: 김민준 (12.3초)
```

---

## 📊 실제 사용 결과

### 장점
✅ **비용 절감**: API 호출 비용 없음
✅ **데이터 보안**: 로컬 처리
✅ **오프라인 가능**: 인터넷 불필요
✅ **커스터마이징**: 모델 선택 자유

### 단점
❌ **속도**: Claude 대비 2-3배 느림
❌ **리소스**: 높은 RAM 요구
❌ **설정**: 초기 설정 복잡

### 비교표

| 항목 | OSS GPT (LM Studio) | Claude API |
|------|-------------------|------------|
| 속도 | 12초/학생 | 5초/학생 |
| 비용 | 무료 | $0.01/1K 토큰 |
| 보안 | 로컬 처리 | 클라우드 |
| 설정 | 복잡 | 간단 |
| 오프라인 | 가능 | 불가능 |

---

## 📋 매일 체크리스트

### 시작 전
- [ ] LM Studio 실행
- [ ] Local Server 시작
- [ ] 모델 로드 확인
- [ ] RAM 10GB+ 여유
- [ ] `.env.local` 확인

### 평가 전
- [ ] 과제 정보 완성
- [ ] 학생 제출물 로드
- [ ] AI 모델 선택
- [ ] Temperature 0.1

### 종료 시
- [ ] 평가 결과 저장
- [ ] LM Studio 정지
- [ ] 로그 확인

---

## 🔐 보안 고려사항

1. **데이터 프라이버시**
   - 모든 데이터 로컬 처리
   - 외부 전송 없음
   - GDPR 준수

2. **액세스 제어**
   - localhost only
   - 환경 변수로 제어
   - 관리자 권한 필요

3. **백업 계획**
   - Claude API 폴백
   - 자동 전환 메커니즘

---

## 🚀 향후 개선 계획

1. **다중 모델 지원**
   - 과제별 최적 모델
   - A/B 테스팅

2. **한국어 특화**
   - 파인튜닝
   - 교육 데이터 학습

3. **성능 개선**
   - 캐싱 시스템
   - 병렬 처리

---

## 📚 참고 자료

- [LM Studio 공식 문서](https://lmstudio.ai/docs)
- [OpenAI API 호환성](https://platform.openai.com/docs)
- [GGUF 모델 형식](https://github.com/ggerganov/llama.cpp)
- [Hugging Face 모델](https://huggingface.co/models?other=gguf)

---

## 관련 파일 위치

```
/Users/hoon/bluenote-monorepo/apps/grading/
├── .env.local                          # 환경 변수
├── docs/                               # 문서
│   └── OSS_GPT_20B_COMPLETE_GUIDE.md  # 이 문서
├── src/
│   ├── lib/
│   │   ├── lm-studio-api.ts           # LM Studio API
│   │   └── ai-evaluator.ts            # AI 통합
│   └── app/
│       ├── api/
│       │   ├── evaluate/              # 평가 API
│       │   └── test-lm-studio/        # 테스트
│       └── assignments/
│           └── [id]/evaluate/         # 평가 UI
```

---

**작성일**: 2025년 9월 3일  
**작성자**: Grading System 개발팀  
**상태**: 🟢 정상 작동 중  
**버전**: 1.0.0

*이 문서는 LM Studio 및 OSS GPT-20B 통합과 관련된 모든 정보를 포함합니다.*