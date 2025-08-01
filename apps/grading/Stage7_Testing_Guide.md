# Stage 7: 종합 테스트 및 검증 가이드

## 과제 공유 기능 구현 완료 사항

### 1. 데이터베이스 변경사항
- Assignment 테이블: userId, userEmail, isShared, sharedAt 필드 추가
- SharedAssignment 테이블: 공유 관계 및 권한 관리
- Evaluation 테이블: userId 필드 추가

### 2. 권한 시스템
- 권한 레벨: none, read, evaluate, write, owner
- 공유 시 권한 설정 가능

### 3. API 엔드포인트
- 과제 공유 관리: `/api/assignments/[assignmentId]/share`
- 권한 검증이 추가된 평가 API
- 과제별 평가자 통계: `/api/stats/assignment-evaluators`

### 4. UI 컴포넌트
- 과제 목록에 공유 버튼 및 상태 표시
- 공유 관리 페이지 (`/assignments/[assignmentId]/share`)

## 테스트 시나리오

### 1. 과제 생성 및 소유권
- [ ] 새 과제 생성 시 userId, userEmail 자동 설정
- [ ] 과제 목록에서 내 과제와 공유받은 과제 구분 표시

### 2. 공유 기능
- [ ] 과제 소유자만 공유 버튼 표시
- [ ] 공유 페이지에서 사용자 추가/제거
- [ ] 권한 설정 (읽기/평가/편집)
- [ ] 자기 자신에게 공유 방지
- [ ] 중복 공유 시 권한 업데이트

### 3. 권한별 기능 테스트

#### 읽기 권한 (read)
- [ ] 과제 정보 조회 가능
- [ ] 제출물 목록 조회 가능
- [ ] 평가 결과 조회 가능
- [ ] 수정/평가 불가

#### 평가 권한 (evaluate)
- [ ] 읽기 권한 모든 기능
- [ ] 새 평가 생성 가능
- [ ] 재평가 가능
- [ ] 과제 수정 불가

#### 편집 권한 (write)
- [ ] 평가 권한 모든 기능
- [ ] 과제 정보 수정 가능
- [ ] 제출물 관리 가능
- [ ] 공유 설정 변경 불가

### 4. 통계 및 추적
- [ ] 과제별 평가자 통계 API 동작
- [ ] 공유 사용자의 평가 활동 추적
- [ ] 모델별 사용량 정확한 집계

### 5. 보안 검증
- [ ] 권한 없는 사용자의 과제 접근 차단
- [ ] 평가 API 권한 검증 동작
- [ ] 배치 평가 API 권한 검증 동작

## 남은 작업 (선택사항)

### 1. 기존 데이터 마이그레이션
```sql
-- userId가 없는 기존 과제들에 대한 처리
-- 옵션 1: 특정 사용자에게 할당
UPDATE "Assignment" 
SET "userId" = (SELECT id FROM "User" WHERE email = 'admin@example.com'),
    "userEmail" = 'admin@example.com'
WHERE "userId" IS NULL;

-- 옵션 2: 첫 번째 평가자에게 할당
UPDATE "Assignment" a
SET "userId" = e."userId",
    "userEmail" = e."evaluatedByUser"
FROM (
  SELECT DISTINCT ON ("assignmentId") 
    "assignmentId", "userId", "evaluatedByUser"
  FROM "Evaluation"
  WHERE "userId" IS NOT NULL
  ORDER BY "assignmentId", "evaluatedAt" ASC
) e
WHERE a.id = e."assignmentId" 
AND a."userId" IS NULL;
```

### 2. UI 개선 사항
- 공유 상태 필터링
- 공유 히스토리 표시
- 권한 변경 알림

### 3. 추가 기능
- 공유 링크 생성
- 공유 만료일 설정
- 그룹 공유 기능

## 테스트 완료 후 체크리스트

- [ ] 모든 테스트 시나리오 통과
- [ ] 기존 기능 정상 동작 확인
- [ ] 성능 이슈 없음 확인
- [ ] 에러 핸들링 적절함 확인
- [ ] 사용자 피드백 반영