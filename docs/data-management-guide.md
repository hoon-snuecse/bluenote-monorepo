# 데이터 관리 가이드

## 개요
이 문서는 Bluenote 프로젝트의 데이터 관리 정책과 절차를 설명합니다.

## 데이터 테이블 구조

### 현재 운영 중인 테이블

1. **user_daily_stats** (일별 사용자 통계)
   - 용도: 사용자별 일별 활동 통계 저장
   - 보관 기간: 6개월
   - 6개월 이후: user_monthly_stats로 압축

2. **user_monthly_stats** (월별 사용자 통계)
   - 용도: 6개월 이상 된 데이터의 월별 집계
   - 보관 기간: 무제한

3. **daily_stats** (전체 일별 통계)
   - 용도: 전체 서비스의 일별 통계
   - 보관 기간: 1년

### 백업 테이블

1. **usage_logs_backup**
   - 용도: usage_logs 테이블의 전체 백업
   - 생성일: 2025-07-27
   - 용도: 데이터 복구 및 감사용

2. **usage_logs_archive**
   - 용도: 3개월 이상 된 로그 아카이브
   - 접근: Service Role만 가능

## 데이터 정리 절차

### 1. 검증 (매월 실행)
```bash
# Supabase SQL Editor에서 실행
/apps/web/migrations/verify_migration.sql
```

### 2. 백업 (분기별 실행)
```sql
-- 백업 테이블 생성
CREATE TABLE public.[테이블명]_backup_[날짜] AS 
SELECT * FROM public.[테이블명];
```

### 3. 아카이빙 (매월 자동 실행)
```bash
# 6개월 이상 된 데이터를 월별로 압축
node apps/web/scripts/archive-old-stats.js
```

### 4. 정리
```sql
-- 아카이빙 완료 후 오래된 데이터 삭제
DELETE FROM public.user_daily_stats
WHERE date < CURRENT_DATE - INTERVAL '6 months';

-- 테이블 최적화
VACUUM FULL public.user_daily_stats;
```

## 자동화 설정

### Cron Job 설정 (권장)
```bash
# 매월 1일 오전 3시에 아카이빙 실행
0 3 1 * * cd /path/to/bluenote-monorepo && node apps/web/scripts/archive-old-stats.js

# 매일 오전 2시에 grading 데이터 동기화
0 2 * * * cd /path/to/bluenote-monorepo && node apps/web/scripts/sync-grading-stats.js
```

## 보안 정책

### RLS 설정 원칙
1. 모든 민감한 테이블은 RLS 활성화
2. Service Role만 접근 가능하도록 설정
3. anon/authenticated 롤의 접근 차단

### 백업 테이블 보안
```sql
-- 백업 테이블은 항상 RLS 활성화
ALTER TABLE public.[백업테이블명] ENABLE ROW LEVEL SECURITY;

-- Service Role만 접근 가능
CREATE POLICY "Service role only" ON public.[백업테이블명]
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON public.[백업테이블명] FROM anon, authenticated;
```

## 모니터링

### 테이블 크기 확인
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size,
  n_live_tup as rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

### 데이터 증가율 모니터링
```sql
-- 일별 데이터 증가량
SELECT 
  date,
  COUNT(*) as new_records
FROM user_daily_stats
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

## 복구 절차

### usage_logs 데이터 복구 (필요시)
```sql
-- 백업에서 특정 기간 데이터 복구
INSERT INTO user_daily_stats (user_email, date, login_count, claude_usage_count)
SELECT 
  user_email,
  DATE(created_at) as date,
  COUNT(CASE WHEN action_type = 'login' THEN 1 END) as login_count,
  COUNT(CASE WHEN action_type = 'claude_api_call' THEN 1 END) as claude_usage_count
FROM usage_logs_backup
WHERE created_at BETWEEN '시작일' AND '종료일'
  AND user_email IS NOT NULL
GROUP BY user_email, DATE(created_at)
ON CONFLICT (user_email, date) DO NOTHING;
```

## 주의사항

1. **삭제 전 반드시 백업 확인**
   - 백업 테이블의 레코드 수 확인
   - 최근 데이터 포함 여부 확인

2. **단계별 실행**
   - 모든 스크립트는 단계별로 실행
   - 각 단계 후 검증 필수

3. **Service Role 사용 주의**
   - 프로덕션 환경에서는 최소 권한 원칙 적용
   - 정기적인 권한 감사

## 문제 해결

### PostgREST 캐시 문제
```sql
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
```

### 테이블 잠금 문제
```sql
-- 잠금 확인
SELECT * FROM pg_locks WHERE relation::regclass::text LIKE '%user_daily_stats%';

-- 강제 연결 종료 (주의!)
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE query LIKE '%user_daily_stats%' AND pid <> pg_backend_pid();