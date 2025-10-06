# 현재 작동 중인 LM Studio 설정 및 연결 가이드

## 📌 현재 실제 사용 중인 설정

이 문서는 2025년 9월 3일 기준으로 실제 Grading 앱에서 LM Studio와 연결하여 학생 평가를 수행하고 있는 설정을 기록합니다.

## 🔧 현재 환경 설정

### 1. LM Studio 서버 상태
```
URL: http://localhost:1234/v1
상태: 실행 중 ✅
모델: openai/gpt-oss-20b
```

### 2. 환경 변수 (.env.local)
```env
# LM Studio Configuration
LM_STUDIO_ENABLED="true"
LM_STUDIO_URL="http://localhost:1234/v1"
```

### 3. 실제 사용 중인 모델 정보
- **모델명**: openai/gpt-oss-20b
- **모델 크기**: 약 20B 파라미터
- **메모리 사용량**: 약 25-30GB RAM
- **응답 시간**: 학생 1명당 약 10-15초

## 💻 실제 연결 과정

### Step 1: LM Studio 실행
```bash
# 1. LM Studio 앱 실행
# macOS: Applications 폴더에서 LM Studio 더블클릭
# Windows: 시작 메뉴에서 LM Studio 실행

# 2. Local Server 탭으로 이동
# 3. 이미 로드된 모델 확인 (openai/gpt-oss-20b)
# 4. "Start Server" 버튼 클릭
```

### Step 2: 서버 상태 확인
```bash
# 터미널에서 확인
curl http://localhost:1234/v1/models

# 응답 예시
{
  "object": "list",
  "data": [
    {
      "id": "openai/gpt-oss-20b",
      "object": "model",
      "created": 1704240000,
      "owned_by": "openai"
    }
  ]
}
```

### Step 3: Grading 앱 개발 서버 실행
```bash
# grading 앱 디렉토리에서
cd /Users/hoon/bluenote-monorepo/apps/grading
npm run dev

# 실행 확인
# http://localhost:3002 접속
```

### Step 4: 테스트 페이지에서 연결 확인
```
URL: http://localhost:3002/test-lm-studio

예상 결과:
{
  "available": true,
  "models": ["openai/gpt-oss-20b"],
  "testResult": {
    "success": true,
    "evaluation": { ... }
  }
}
```

## 📝 실제 평가 수행 방법

### 1. 과제 평가 페이지 접속
```
URL: http://localhost:3002/assignments/[assignmentId]/evaluate
또는
URL: https://grading.bluenote.site/assignments/[assignmentId]/evaluate
```

### 2. AI 모델 선택
- 드롭다운 메뉴에서 **"OSS GPT (로컬)"** 선택
- Claude API 대신 로컬 LM Studio 사용

### 3. Temperature 설정
- 현재 사용 값: **0.1**
- 슬라이더로 조절 가능 (0.0 ~ 1.0)
- 일관된 평가를 위해 낮은 값 유지

### 4. 평가 실행
1. 학생 제출물 확인
2. "평가 시작" 버튼 클릭
3. 진행 상황 모니터링
   - "평가 중... (1/30)" 형태로 표시
   - 학생당 약 10-15초 소요

## 🔍 실제 코드 구조

### API 엔드포인트 (`/api/evaluate/route.ts`)
```typescript
// AI 모델 선택 로직
if (evaluationModel === 'lm-studio') {
  const lmStudioStatus = await checkLMStudioStatus();
  if (lmStudioStatus.available) {
    // LM Studio 사용
    result = await evaluateWithLMStudio(request);
  } else {
    // Claude로 폴백
    result = await evaluateWithClaude(request);
  }
}
```

### LM Studio API 호출 (`lm-studio-api.ts`)
```typescript
const completion = await lmStudioClient.chat.completions.create({
  model: 'openai/gpt-oss-20b',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.1,  // 현재 사용 중인 값
  max_tokens: 4096,  // 충분한 길이의 피드백을 위해 증가
});
```

## 📊 실제 사용 결과

### 평가 품질
- **일관성**: Temperature 0.1로 안정적인 평가
- **속도**: Claude API 대비 약 2-3배 느림
- **정확도**: 한국어 이해도 양호, 교육적 피드백 적절

### 장점
1. **비용 절감**: API 호출 비용 없음
2. **데이터 보안**: 학생 데이터가 로컬에서만 처리
3. **안정성**: 인터넷 연결 불필요

### 단점
1. **속도**: Claude보다 느림
2. **리소스**: 높은 RAM 사용량 (25-30GB)
3. **초기 설정**: 모델 다운로드 시간 (1-2시간)

## 🛠️ 문제 발생 시 대처법

### 1. "LM Studio 서버 연결 실패" 오류
```bash
# LM Studio 재시작
1. LM Studio에서 "Stop Server" 클릭
2. 1분 대기
3. "Start Server" 다시 클릭

# 포트 충돌 확인
lsof -i :1234
# 다른 프로세스가 사용 중이면 종료
```

### 2. 메모리 부족
```bash
# Activity Monitor (macOS) 또는 작업 관리자 (Windows)에서 확인
# RAM 사용량이 90% 이상이면:

1. 불필요한 앱 종료
2. 브라우저 탭 정리
3. LM Studio에서 더 작은 모델로 변경
   예: gpt-oss-20b → llama-2-13b
```

### 3. 평가 결과 이상
```javascript
// Temperature 조정
setTemperature(0.05);  // 더 낮게 설정

// 출력 형식 명확히 지정
const outputFormat = `
반드시 다음 JSON 형식으로만 응답하세요:
{
  "overallScore": 숫자(0-100),
  "overallGrade": "문자열",
  ...
}
`;
```

## 📋 체크리스트

### 매일 시작 전 확인사항
- [ ] LM Studio 실행됨
- [ ] Local Server 시작됨
- [ ] 모델 로드 완료 (openai/gpt-oss-20b)
- [ ] RAM 여유 공간 10GB 이상
- [ ] `.env.local`에 `LM_STUDIO_ENABLED="true"`

### 평가 전 확인사항
- [ ] 과제 정보 완성도 (평가 기준, 출력 형식)
- [ ] 학생 제출물 로드 완료
- [ ] AI 모델 "OSS GPT (로컬)" 선택
- [ ] Temperature 0.1 설정

## 🔗 관련 파일 위치

```
/Users/hoon/bluenote-monorepo/apps/grading/
├── .env.local                              # 환경 변수 설정
├── src/
│   ├── lib/
│   │   ├── lm-studio-api.ts               # LM Studio API 클라이언트
│   │   └── ai-evaluator.ts                # AI 평가 통합 모듈
│   └── app/
│       ├── api/
│       │   ├── evaluate/route.ts          # 평가 API
│       │   └── test-lm-studio/route.ts    # 테스트 API
│       └── assignments/
│           └── [assignmentId]/
│               └── evaluate/page.tsx      # 평가 UI
```

## 📈 성능 모니터링

### 현재 성능 지표
- **평균 응답 시간**: 12초/학생
- **메모리 사용량**: 25-30GB (모델 로드 후)
- **CPU 사용률**: 60-80% (평가 중)
- **성공률**: 95% (5%는 Claude로 폴백)

### 로그 확인
```bash
# 개발 서버 로그에서 확인
npm run dev

# 콘솔 출력 예시
LM Studio 평가 시작: {
  studentName: '김민준',
  assignmentTitle: '설명문 쓰기',
  model: 'openai/gpt-oss-20b'
}
LM Studio 응답 수신 완료
평가 완료: 김민준 (12.3초)
```

## 💡 팁과 권장사항

1. **배치 처리**: 한 번에 5명씩 평가하여 효율성 향상
2. **야간 처리**: 대량 평가는 야간에 수행 권장
3. **백업 계획**: Claude API 키 항상 준비
4. **정기 재시작**: 매일 LM Studio 서버 재시작 권장

---

**작성일**: 2025년 9월 3일  
**작성자**: Grading System 개발팀  
**현재 상태**: 🟢 정상 작동 중