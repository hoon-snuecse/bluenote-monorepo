# Grading 앱 통합 개정 문서

## 작성일: 2025-09-01

## 개요
Grading 시스템을 bluenote-monorepo의 grading 앱으로 통합하여 단일화했습니다. 기존의 분산된 구조에서 통합된 구조로 전환하여 데이터 일관성과 유지보수성을 향상시켰습니다.

## 변경 전 구조 (기존)

### 1. grading_gpt 앱 (독립 프로젝트)
- **포트**: 3000
- **데이터베이스**: SQLite (로컬)
- **특징**:
  - LM Studio 통합으로 로컬 AI 채점
  - SQLite 로컬 DB 사용
  - Supabase 동기화 기능 (복잡하고 불안정)
  - 다운로드/업로드 방식의 동기화
- **문제점**:
  - 동기화 오류 빈번
  - 데이터 불일치 가능성
  - 별도 프로젝트 관리 필요

### 2. bluenote-monorepo grading 앱
- **포트**: 3002  
- **데이터베이스**: Supabase (직접 연결)
- **특징**:
  - 프로덕션과 동일한 DB 사용
  - 통합 인증 시스템

## 변경 후 구조 (현재) ✅

### 통합된 단일 앱 구조
- **개발 환경**: http://localhost:3002
- **프로덕션**: https://grading.bluenote.site
- **데이터베이스**: Supabase (직접 연결)
- **특징**:
  - 로컬과 프로덕션이 동일한 Supabase DB 사용
  - 실시간 데이터 동기화
  - 통합 인증 시스템 (@bluenote/supabase-auth)
  - 데이터 자동 공유

## 주요 개선사항

### 1. 데이터 일관성
- 단일 데이터베이스 사용으로 동기화 문제 해결
- 로컬 개발과 프로덕션 간 즉시 데이터 공유
- 복잡한 동기화 로직 제거

### 2. 인증 통합
- @bluenote/supabase-auth 패키지 사용
- Google OAuth 통합
- 세션 관리 일원화

### 3. 유지보수성
- Monorepo 구조로 통합 관리
- 공통 패키지 재사용
- 단일 배포 파이프라인

### 4. 개발 효율성
- 하나의 코드베이스 관리
- 통합된 개발 환경
- 간소화된 설정

## 마이그레이션 가이드

### 개발자를 위한 전환 방법

1. **grading_gpt 앱 종료**
   ```bash
   # grading_gpt 서버 종료
   # 포트 3000 사용 중단
   ```

2. **bluenote-monorepo grading 앱 사용**
   ```bash
   # monorepo 루트에서
   pnpm dev --filter=@bluenote/grading
   
   # 또는 grading 앱 디렉토리에서
   cd apps/grading
   npm run dev
   ```

3. **환경 변수 확인**
   - `/apps/grading/.env.local` 파일 확인
   - 필수 변수:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `ANTHROPIC_API_KEY` (Claude AI 사용 시)

## 검증 완료 사항

### 2025-09-01 검증 결과
1. ✅ 로컬 개발 환경 (포트 3002) 정상 작동
2. ✅ Supabase 데이터베이스 연결 확인
3. ✅ 인증 시스템 작동 확인
4. ✅ LM Studio 채점 결과 Supabase 저장 확인
5. ✅ 프로덕션 사이트와 데이터 공유 확인

### 채점 기록 확인
- 총 94개 평가 데이터 확인
- 최신 채점: 2025-09-01 14:20:49 (LM Studio)
- 사용자: hoon@snuecse.org
- 모든 데이터가 grading.bluenote.site에서도 확인 가능

## 권장사항

### 즉시 조치사항
1. grading_gpt 프로젝트는 참고용으로만 보관
2. 모든 개발은 bluenote-monorepo/apps/grading에서 진행
3. 포트 3000은 다른 용도로 사용 가능

### 장기 계획
1. grading_gpt의 유용한 기능 선별적 이전
   - LM Studio 통합 코드
   - 로컬 캐싱 로직 (필요시)
2. 통합 테스트 환경 구축
3. CI/CD 파이프라인 최적화

## 기술 스택

### 현재 사용 중인 기술
- **Framework**: Next.js 15.3.5 (App Router)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: @bluenote/supabase-auth
- **AI Integration**: Claude API (Anthropic)
- **UI**: Tailwind CSS v4
- **Monorepo**: Turborepo with pnpm

## 문제 해결

### 포트 충돌 시
```bash
# 포트 3002 사용 프로세스 확인
lsof -i :3002

# 필요시 프로세스 종료
kill -9 [PID]
```

### 인증 문제 시
1. `.env.local` 파일의 Supabase 키 확인
2. Google OAuth 설정 확인
3. 브라우저 쿠키 삭제 후 재로그인

### 데이터베이스 연결 문제 시
1. Supabase 프로젝트 상태 확인
2. SERVICE_ROLE_KEY 유효성 확인
3. RLS 정책 확인

## 연락처
- 프로젝트 관리자: hoon@snuecse.org
- Repository: bluenote-monorepo

---

*이 문서는 2025년 9월 1일 grading 시스템 통합 작업의 일환으로 작성되었습니다.*