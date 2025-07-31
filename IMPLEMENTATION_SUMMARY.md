# RLS 및 샘플 데이터 구현 요약

## 완료된 작업

### 1. Quiz 앱 (Supabase)
- ✅ 데이터베이스 스키마에 샘플 필드 추가 (`is_sample`, `sample_order`, `sample_category`)
- ✅ API 엔드포인트 수정하여 myQuizzes와 sampleQuizzes 분리
- ✅ UI 수정하여 샘플 퀴즈를 시각적으로 구분 (노란색 테두리, "샘플" 배지)
- ✅ RLS 정책 업데이트 스크립트 생성

### 2. Grading 앱 (Prisma/SQLite)
- ✅ Prisma 스키마에 샘플 필드 추가
- ✅ API 엔드포인트 수정하여 데이터 분리
- ✅ UI 수정하여 샘플 과제를 시각적으로 구분 (Sparkles 아이콘, 노란색 스타일)
- ✅ 샘플 데이터 seed 스크립트 생성

## 필요한 수동 작업

### 1. Quiz 앱 (Supabase)
1. Supabase 대시보드 SQL Editor에서 실행:
   ```bash
   /Users/hoon/bluenote-monorepo/supabase-final-update.sql
   ```
   
2. 실행 순서:
   - RLS 정책 삭제 및 재생성
   - 샘플 퀴즈 데이터 삽입
   - 샘플 문항 및 선택지 삽입

### 2. Grading 앱 (Prisma)
1. 마이그레이션 실행:
   ```bash
   cd apps/grading
   pnpm prisma migrate dev --name add_sample_fields
   pnpm prisma generate
   ```

2. 샘플 데이터 삽입:
   ```bash
   pnpm tsx prisma/seed-samples.ts
   ```

### 3. 테스트
1. 양쪽 앱 실행:
   ```bash
   pnpm dev
   ```

2. 확인 사항:
   - Quiz 앱: http://localhost:3000/saved 에서 샘플 퀴즈 표시 확인
   - Grading 앱: http://localhost:3001/assignments 에서 샘플 과제 표시 확인
   - 샘플 데이터가 노란색으로 구분되는지 확인
   - 샘플 데이터는 수정/삭제 불가능한지 확인

## 주요 변경사항

### 데이터베이스
- 모든 주요 테이블에 `is_sample`, `sample_order`, `sample_category` 필드 추가
- RLS 정책을 "자신의 데이터 OR 샘플 데이터" 방식으로 수정

### UI/UX
- 샘플 데이터는 별도 섹션으로 분리
- 시각적 구분: 노란색 테두리, 배지, 아이콘
- 샘플 데이터 설명 텍스트 추가

### 보안
- 샘플 데이터는 읽기 전용
- 사용자는 샘플 데이터를 수정/삭제할 수 없음
- RLS 정책으로 데이터 접근 제어

## 문제 해결 과정

1. **UUID 타입 오류**: Quiz 앱이 `user_email` 필드를 사용하는 것을 발견하여 RLS 정책 수정
2. **인증 방식 차이**: `current_setting('app.current_user_email')` 방식에 맞춰 정책 재작성
3. **테이블 존재 여부**: 조건부 스크립트로 존재하는 테이블만 처리

## 다음 단계

1. 프로덕션 배포 시 샘플 데이터 자동 생성 스크립트 CI/CD에 포함
2. 관리자 페이지에서 샘플 데이터 관리 기능 추가 고려
3. 샘플 데이터 카테고리 확장 (과목별, 학년별)