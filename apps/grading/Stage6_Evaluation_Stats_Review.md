# Stage 6: 평가 통계 시스템 검토 및 개선

## 현재 상태 분석

### 1. 기존 통계 API
- `/api/stats/route.ts`: 전체 평가 통계 (모델별, 오늘/전체)
- `/api/stats/users/route.ts`: 사용자별 모델 사용 통계
- `/api/stats/daily-user-evaluations/route.ts`: 일별 사용자 평가 통계

### 2. 발견된 이슈

#### A. userId 필드 활용 미흡
- Evaluation 테이블에 userId 필드가 추가되었지만, 통계 API들이 여전히 evaluatedByUser(이메일)만 사용
- User 테이블과의 JOIN 없이 이메일 기반으로만 집계

#### B. 권한 검증 부재
- 평가 생성 API(`/api/evaluations/route.ts`)에 과제 권한 확인 없음
- 누구나 아무 과제에 대한 평가를 생성할 수 있는 보안 취약점

#### C. 공유 과제 통계 미포함
- 공유된 과제에 대한 평가 통계가 별도로 관리되지 않음
- 과제 소유자가 공유 사용자들의 평가 활동을 파악하기 어려움

## 개선 사항

### 1. 평가 API 권한 검증 추가

```typescript
// /api/evaluations/route.ts 수정
import { checkAssignmentPermission } from '@/lib/assignment-auth';

// POST 함수 내 권한 확인 추가
const permission = await checkAssignmentPermission(assignmentId, userEmail);
if (!permission.canEvaluate) {
  return NextResponse.json(
    { success: false, error: '이 과제를 평가할 권한이 없습니다.' },
    { status: 403 }
  );
}

// userId 추가
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// Evaluation 생성 시 userId 포함
data: {
  // ... 기존 필드
  evaluatedByUser: userEmail,
  userId: user?.id
}
```

### 2. 통계 API 개선

#### A. 과제별 평가자 통계 API 추가
```typescript
// /api/stats/assignment-evaluators/route.ts
// 특정 과제의 평가자별 통계 (공유 사용자 포함)
```

#### B. 기존 통계 API userId 활용
```typescript
// userId 기반 집계로 변경
// User 테이블과 JOIN하여 더 정확한 사용자 정보 제공
```

### 3. 관리자 대시보드 통합

#### A. 공유 과제 통계 표시
- 내가 소유한 과제의 평가 통계
- 내가 평가 권한을 받은 과제의 통계
- 공유한 사용자들의 평가 활동

#### B. 모델별 사용량 추적
- userId 기반으로 더 정확한 사용자별 통계
- 과제 소유자별 모델 사용량 분리

## 구현 계획

1. **평가 권한 검증** (필수)
   - `/api/evaluations/route.ts` 수정
   - 과제 권한 확인 로직 추가

2. **통계 API 개선** (선택)
   - userId 활용한 집계
   - 과제별 평가자 통계 추가

3. **대시보드 개선** (선택)
   - 공유 과제 통계 표시
   - 더 상세한 사용자별 분석

## 우선순위

1. **높음**: 평가 API 권한 검증 (보안 이슈)
2. **중간**: 통계 API userId 활용
3. **낮음**: 대시보드 UI 개선