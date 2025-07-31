# RLS 및 샘플 데이터 구현 가이드

## 개요
Supabase의 Row Level Security (RLS) 정책을 활성화하면서도 사용자가 샘플 데이터를 볼 수 있도록 구현한 내용을 정리합니다.

## 구현 내용

### 1. 데이터베이스 스키마 개선

#### Quiz 앱 (Supabase)
```sql
-- quizzes 테이블에 샘플 필드 추가
ALTER TABLE public.quizzes ADD COLUMN is_sample BOOLEAN DEFAULT FALSE;
ALTER TABLE public.quizzes ADD COLUMN sample_order INTEGER;
ALTER TABLE public.quizzes ADD COLUMN sample_category TEXT;

-- RLS 정책 수정: 자신의 퀴즈 + 샘플 퀴즈 조회 가능
CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()::text 
        OR is_sample = true
    );
```

#### Grading 앱 (Prisma/PostgreSQL)
```prisma
model Assignment {
  // ... 기존 필드들
  isSample       Boolean  @default(false)
  sampleOrder    Int?
  sampleCategory String?
  
  @@index([isSample])
}
```

### 2. API 엔드포인트 개선

#### Quiz 앱 API (`/apps/quiz/src/app/api/quizzes/route.js`)
- 내 퀴즈와 샘플 퀴즈를 분리하여 반환
```javascript
return NextResponse.json({
  data: {
    myQuizzes: myQuizzes || [],
    sampleQuizzes: sampleQuizzes || []
  },
  pagination: { ... }
})
```

#### Grading 앱 API (`/apps/grading/src/app/api/assignments/route.ts`)
- 샘플 필드를 포함하여 정렬 및 반환
```typescript
const assignments = await prisma.assignment.findMany({
  orderBy: [
    { isSample: 'asc' },
    { sampleOrder: 'asc' },
    { createdAt: 'desc' }
  ]
});
```

### 3. UI 구현

#### Quiz 앱 (`/apps/quiz/src/app/(quiz)/saved/page.js`)
- 샘플 퀴즈 섹션을 별도로 표시
- 노란색 테두리와 "샘플" 배지로 시각적 구분
- 샘플 퀴즈는 수정/삭제 불가

#### Grading 앱 (`/apps/grading/src/app/assignments/page.tsx`)
- 샘플 과제 섹션을 상단에 배치
- Sparkles 아이콘과 노란색 스타일로 구분
- "내 과제" 섹션을 별도로 표시

### 4. 샘플 데이터

#### Quiz 앱 샘플 데이터
- 초등학교 과학 퀴즈 (물의 순환)
- 중학교 역사 퀴즈 (삼국시대)
- 고등학교 수학 퀴즈 (미적분 기초)

#### Grading 앱 샘플 데이터
- 초등 4학년 논설문 - 환경보호
- 중학교 2학년 문학 감상문 - 소설 독후감
- 고등학교 1학년 탐구보고서 - 과학 실험

## 실행 방법

### 1. Quiz 앱 (Supabase)
```bash
# Supabase 대시보드에서 SQL 편집기 사용
# 1. RLS 활성화 스크립트 실행
# 2. 샘플 데이터 지원 스키마 스크립트 실행
# 3. 샘플 데이터 삽입 스크립트 실행
```

### 2. Grading 앱 (Prisma)
```bash
# Prisma 마이그레이션 실행
pnpm db:migrate:dev --filter=grading

# 샘플 데이터 시드
pnpm db:seed:samples --filter=grading
```

## 보안 고려사항

1. **RLS 정책**: 모든 테이블에 RLS가 활성화되어 있으며, 사용자는 자신의 데이터와 샘플 데이터만 볼 수 있습니다.

2. **샘플 데이터 보호**: 샘플 데이터는 수정/삭제가 불가능하도록 정책이 설정되어 있습니다.

3. **사용자 격리**: 각 사용자는 다른 사용자의 데이터를 볼 수 없습니다.

## 향후 개선사항

1. 샘플 데이터 관리 인터페이스 (관리자용)
2. 샘플 데이터 카테고리별 필터링
3. 샘플 데이터 복사 기능 (템플릿으로 활용)
4. 샘플 데이터 평가/피드백 시스템