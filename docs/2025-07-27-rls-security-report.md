# 2025-07-27 보안 및 RLS 작업 보고서

## 개요
관리자 대시보드의 통계 페이지에서 사용자 수가 0으로 표시되고, 일부 섹션이 누락되는 문제를 해결하는 과정에서 RLS(Row Level Security) 보안 이슈를 발견하고 해결했습니다.

## 주요 문제점

### 1. 초기 문제
- 관리자 대시보드(/admin/analytics)에서 totalUsers: 0 표시
- "최근 콘텐츠" 섹션 누락
- "사용자별 활동 상태" 섹션 누락
- `Load failed` TypeError 발생

### 2. 근본 원인
- **잘못된 컴포넌트 참조**: AdminAnalyticsClient가 아닌 AdminAnalyticsClient2 사용 중
- **RLS 정책 문제**: anon/authenticated 롤이 민감한 테이블에 접근 가능
- **데이터 구조 문제**: usage_logs 테이블 직접 접근 대신 daily_stats 사용으로 변경됨

## 해결 과정

### Phase 1: 민감한 테이블 보호

#### 1.1 user_permissions 테이블
```sql
-- RLS 활성화
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.user_permissions;

-- Service Role 전용 정책
CREATE POLICY "Service role only" ON public.user_permissions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 권한 제거
REVOKE ALL ON public.user_permissions FROM anon, authenticated;
```

#### 1.2 usage_logs 테이블
```sql
-- RLS 활성화 및 동일한 보안 정책 적용
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.usage_logs
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);
REVOKE ALL ON public.usage_logs FROM anon, authenticated;
```

### Phase 2: user_daily_stats 테이블 생성

통계 데이터를 안전하게 저장하고 조회하기 위한 새로운 테이블 구조:

```sql
CREATE TABLE IF NOT EXISTS public.user_daily_stats (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  login_count INTEGER DEFAULT 0,
  claude_usage_count INTEGER DEFAULT 0,
  grading_sonnet_count INTEGER DEFAULT 0,
  grading_opus_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  last_device TEXT,
  last_browser TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_email, date)
);
```

### Phase 3: API 구조 개선

Service Role을 사용하는 새로운 API 엔드포인트 생성:
- `/api/admin/analytics-fixed` - Service Role로 모든 테이블 접근

## RLS 설정 시 주의사항

### 1. PostgREST 캐시 문제
PostgREST는 권한을 캐시하므로 변경사항이 즉시 반영되지 않을 수 있습니다.

**해결방법:**
```sql
-- 캐시 강제 새로고침
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
```

### 2. Service Role 권한 확인
RLS 정책을 설정한 후에도 Service Role이 접근할 수 없는 경우가 있습니다.

**해결방법:**
```sql
-- Service Role에 명시적 권한 부여
GRANT ALL ON public.테이블명 TO service_role;
GRANT USAGE ON SEQUENCE public.테이블명_id_seq TO service_role;
```

### 3. RLS 정책 우선순위
- `REVOKE ALL`을 먼저 실행한 후 필요한 권한만 부여
- RLS 정책은 GRANT보다 우선순위가 높음
- Service Role은 RLS를 우회하지만, 명시적 권한은 필요

### 4. 보안 검증 쿼리
```sql
-- 민감한 테이블의 보안 상태 확인
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS 활성' ELSE '❌ RLS 비활성' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_permissions', 'usage_logs', 'user_daily_stats');

-- 권한 확인
SELECT 
  table_name,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
  AND table_name IN ('user_permissions', 'usage_logs', 'user_daily_stats')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
```

## 구현 결과

### 1. 보안 강화
- 민감한 테이블(user_permissions, usage_logs)은 Service Role만 접근 가능
- anon/authenticated 롤의 불필요한 권한 제거
- 각 테이블별 적절한 RLS 정책 적용

### 2. 데이터 통합
- user_daily_stats 테이블로 사용자별 일별 통계 중앙화
- 기존 데이터 마이그레이션 완료
- grading 앱과의 데이터 동기화 구현

### 3. 성능 개선
- 효율적인 인덱스 추가
- 불필요한 조인 제거
- 데이터 집계 최적화

## 향후 권장사항

1. **정기적인 보안 감사**
   - `/migrations/check_rls_status.sql` 스크립트 정기 실행
   - 새로운 테이블 생성 시 RLS 정책 필수 적용

2. **Service Role 사용 최소화**
   - 가능한 경우 더 제한적인 권한 사용
   - 민감한 작업은 서버 사이드에서만 처리

3. **모니터링**
   - 비정상적인 접근 패턴 감지
   - Service Role 사용 로그 추적

## 파일 변경 내역

### 생성된 파일
- `/migrations/create_user_daily_stats.sql`
- `/migrations/migrate_to_user_daily_stats.sql`
- `/migrations/check_rls_status.sql`
- `/app/api/admin/analytics-fixed/route.js`
- `/scripts/sync-grading-stats.js`
- `grading앱/src/app/api/stats/daily-user-evaluations/route.ts`

### 삭제된 파일
- `/app/api/admin/analytics-minimal/route.js`
- `/app/admin/analytics/AdminAnalyticsClient.js`
- `/app/api/admin/test-analytics/route.js`
- `/app/api/admin/analytics/` 폴더

### 수정된 파일
- `/app/admin/analytics/AdminAnalyticsClient2.js` - API 엔드포인트 변경

## 결론

RLS 설정은 단순히 정책을 추가하는 것 이상의 주의가 필요합니다. PostgREST 캐시, Service Role 권한, 정책 우선순위 등을 종합적으로 고려해야 하며, 변경 후에는 반드시 검증이 필요합니다. 이번 작업을 통해 보안이 크게 강화되었으며, 향후 유사한 문제 발생을 방지할 수 있는 체계를 마련했습니다.