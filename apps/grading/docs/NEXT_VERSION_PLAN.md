# 다음 버전 계획 - 기준 답안 생성 기능

## 개요
현재 공유 기능은 과제의 구조(평가 영역, 채점 기준)만 공유하지만, 실제 평가 사례가 없어 채점 기준을 이해하기 어려운 한계가 있습니다. 이를 해결하기 위해 AI를 활용한 "기준 답안 생성" 기능을 추가합니다.

## 배경
- **문제점**: 채점 기준만으로는 각 수준의 구체적인 차이를 이해하기 어려움
- **개인정보 이슈**: 실제 학생 글을 공유하면 개인정보 보호 문제 발생
- **해결책**: AI가 생성한 익명의 기준 답안으로 각 평가 수준을 예시

## 주요 기능

### 1. 과제 생성 시 기준 답안 자동 생성
```typescript
// 과제 생성 옵션
interface AssignmentCreationOptions {
  generateExamples: boolean;  // 기준 답안 생성 여부
  exampleCount: number;       // 수준별 예시 개수 (기본값: 1)
}
```

### 2. 기준 답안 구성
- 각 평가 영역 × 평가 수준별로 1개 이상의 예시 글 생성
- 예시: 4개 영역 × 4개 수준 = 16개 기준 답안
- 각 답안에는 해당 수준인 이유에 대한 설명 포함

### 3. 데이터베이스 스키마 확장
```prisma
model ExampleSubmission {
  id            String   @id @default(cuid())
  assignmentId  String
  domain        String   // 평가 영역 (예: "주장의 명확성")
  level         String   // 평가 수준 (예: "매우 우수")
  levelIndex    Int      // 수준 순서 (0: 최고, 3: 최저)
  content       String   @db.Text  // AI가 생성한 예시 글
  explanation   String   @db.Text  // 이 수준으로 평가한 이유
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  assignment    Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  
  @@index([assignmentId, domain, levelIndex])
}
```

### 4. 생성 프로세스
```
1. 과제 기본 정보 저장 (즉시)
2. 백그라운드 작업으로 기준 답안 생성 시작
3. 생성 진행 상태 표시 (0% → 100%)
4. 완료 시 알림 및 검토 가능
```

### 5. UI/UX 개선사항

#### 과제 생성 페이지
```
[✓] AI 기준 답안 자동 생성 (권장)
    ⓘ 각 평가 수준별로 예시 글을 자동으로 생성합니다.
    
    생성 옵션:
    • 수준별 예시 개수: [1개 ▼]
    • 예상 소요 시간: 약 15-20초
    • 예상 비용: 약 ₩1,000
```

#### 기준 답안 검토/수정 페이지
- 생성된 답안을 표 형식으로 표시
- 각 답안별 수정/재생성 버튼
- 부적절한 내용 신고 기능

### 6. API 설계

#### 기준 답안 생성 API
```typescript
POST /api/assignments/{id}/generate-examples
{
  domains: string[],
  levels: string[],
  regenerate?: boolean  // 기존 답안 재생성 여부
}
```

#### 기준 답안 조회 API
```typescript
GET /api/assignments/{id}/examples
Response: {
  examples: ExampleSubmission[],
  generationStatus: 'pending' | 'generating' | 'completed' | 'failed',
  progress: number  // 0-100
}
```

## 기술적 고려사항

### 1. AI API 통합
- Claude API 사용 (현재 프로젝트와 일관성)
- 프롬프트 최적화로 학년/글쓰기 유형별 적절한 수준 생성
- 토큰 사용량 모니터링 및 비용 관리

### 2. 비동기 처리
- Bull Queue 또는 BullMQ 사용
- Redis 기반 작업 큐 구현
- 실패 시 재시도 로직

### 3. 캐싱 전략
- 자주 사용되는 조합(학년+글쓰기유형+평가영역)은 템플릿화
- 생성된 답안 재사용으로 비용 절감

### 4. 품질 관리
```typescript
interface QualityCheck {
  appropriateLength: boolean;     // 학년별 적정 글자수
  gradeAppropriate: boolean;      // 학년 수준 어휘 사용
  domainRelevant: boolean;        // 평가 영역 관련성
  levelDistinct: boolean;         // 수준 간 명확한 차이
}
```

## 예상 효과

### 1. 교육적 가치
- 채점 기준의 구체적 이해 향상
- 평가의 일관성과 객관성 증대
- 신규 교사의 평가 역량 향상

### 2. 사용성 개선
- 공유 템플릿의 실용성 증대
- 학생/학부모에게 평가 기준 설명 용이
- 평가 투명성 향상

### 3. 확장 가능성
- 향후 학생 자가진단 도구로 활용
- 평가 루브릭 학습 자료로 발전
- AI 평가와 인간 평가의 비교 연구

## 구현 일정 (예상)

### Phase 1: 기반 구축 (2주)
- [ ] DB 스키마 확장
- [ ] 작업 큐 시스템 구축
- [ ] AI API 통합 및 프롬프트 개발

### Phase 2: 핵심 기능 구현 (3주)
- [ ] 과제 생성 UI 개선
- [ ] 기준 답안 생성 API
- [ ] 기준 답안 관리 페이지

### Phase 3: 고도화 (2주)
- [ ] 품질 검증 시스템
- [ ] 캐싱 및 최적화
- [ ] 사용자 피드백 반영

### Phase 4: 테스트 및 배포 (1주)
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 단계적 배포

## 리스크 관리

### 1. 비용 관리
- 월별/일별 생성 한도 설정
- 유료 기능으로 분리 검토
- 효율적인 프롬프트로 토큰 사용 최소화

### 2. 품질 이슈
- 교사의 검토/승인 프로세스
- 부적절한 내용 필터링
- 커뮤니티 피드백 시스템

### 3. 기술적 복잡성
- 단계적 구현으로 리스크 분산
- 충분한 테스트 기간 확보
- 롤백 계획 수립

## 성공 지표

1. **사용률**: 과제 생성 시 80% 이상이 기준 답안 생성 옵션 선택
2. **만족도**: 기준 답안 품질에 대한 만족도 4.0/5.0 이상
3. **활용도**: 공유 템플릿 사용률 50% 증가
4. **비용 효율성**: 과제당 평균 생성 비용 ₩1,000 이하 유지

## 향후 발전 방향

1. **다국어 지원**: 영어, 중국어 등 다국어 기준 답안 생성
2. **맞춤형 생성**: 학교/지역별 특성을 반영한 답안 생성
3. **학습 분석**: 기준 답안과 실제 학생 글의 차이 분석 도구
4. **AI 평가 보조**: 기준 답안을 활용한 자동 평가 시스템

---

*작성일: 2025년 8월 1일*
*작성자: Claude Code (AI Assistant)*
*검토 필요: 프로젝트 관리자 및 개발팀*