-- 데이터 백업 및 정리 스크립트
-- 주의: 이 스크립트는 단계별로 신중하게 실행해야 합니다!

-- ============================================
-- STEP 1: 백업 테이블 생성 (즉시 실행 가능)
-- ============================================

-- usage_logs 백업 테이블 생성
CREATE TABLE IF NOT EXISTS public.usage_logs_backup AS 
SELECT * FROM public.usage_logs;

-- 백업 테이블에 원본과 동일한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_usage_logs_backup_user_email 
ON public.usage_logs_backup(user_email);

CREATE INDEX IF NOT EXISTS idx_usage_logs_backup_created_at 
ON public.usage_logs_backup(created_at);

CREATE INDEX IF NOT EXISTS idx_usage_logs_backup_action_type 
ON public.usage_logs_backup(action_type);

-- 백업 테이블 통계
SELECT 
  'usage_logs_backup' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_email) as unique_users,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record,
  pg_size_pretty(pg_total_relation_size('public.usage_logs_backup')) as table_size
FROM public.usage_logs_backup;

-- ============================================
-- STEP 2: 백업 검증 (백업 후 실행)
-- ============================================

-- 원본과 백업 비교
SELECT 
  'usage_logs' as table_name, COUNT(*) as record_count 
FROM public.usage_logs
UNION ALL
SELECT 
  'usage_logs_backup' as table_name, COUNT(*) as record_count 
FROM public.usage_logs_backup;

-- 백업 무결성 확인
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM usage_logs) = (SELECT COUNT(*) FROM usage_logs_backup) 
    THEN '✅ 백업 성공: 레코드 수 일치'
    ELSE '❌ 백업 실패: 레코드 수 불일치'
  END as backup_status,
  (SELECT COUNT(*) FROM usage_logs) as original_count,
  (SELECT COUNT(*) FROM usage_logs_backup) as backup_count;

-- ============================================
-- STEP 3: 아카이빙 정책 설정을 위한 데이터 분석
-- ============================================

-- 월별 데이터 분포 확인
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as record_count,
  COUNT(DISTINCT user_email) as unique_users,
  pg_size_pretty(
    (COUNT(*)::float / (SELECT COUNT(*) FROM usage_logs) * 
    pg_total_relation_size('public.usage_logs'))::bigint
  ) as estimated_size
FROM public.usage_logs
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 액션 타입별 분포
SELECT 
  action_type,
  COUNT(*) as count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM usage_logs) * 100, 2) as percentage
FROM public.usage_logs
GROUP BY action_type
ORDER BY count DESC;

-- ============================================
-- STEP 4: 오래된 데이터 아카이빙 (선택적)
-- ============================================

-- 3개월 이상 된 데이터를 별도 테이블로 아카이빙
CREATE TABLE IF NOT EXISTS public.usage_logs_archive AS
SELECT * FROM public.usage_logs
WHERE created_at < CURRENT_DATE - INTERVAL '3 months';

-- 아카이빙된 데이터 통계
SELECT 
  'Archived records' as description,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM public.usage_logs_archive;

-- ============================================
-- STEP 5: user_daily_stats 데이터 압축 및 최적화
-- ============================================

-- 6개월 이상 된 데이터를 월별로 집계
CREATE TABLE IF NOT EXISTS public.user_monthly_stats AS
SELECT 
  user_email,
  DATE_TRUNC('month', date)::date as month,
  SUM(login_count) as login_count,
  SUM(claude_usage_count) as claude_usage_count,
  SUM(grading_sonnet_count) as grading_sonnet_count,
  SUM(grading_opus_count) as grading_opus_count,
  SUM(post_count) as post_count,
  MAX(last_login_at) as last_login_at,
  COUNT(*) as days_with_activity
FROM public.user_daily_stats
WHERE date < CURRENT_DATE - INTERVAL '6 months'
GROUP BY user_email, DATE_TRUNC('month', date);

-- ============================================
-- STEP 6: 권한 설정 (백업 테이블에 대해)
-- ============================================

-- 백업 테이블은 Service Role만 접근 가능
ALTER TABLE public.usage_logs_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.usage_logs_backup
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role only" ON public.usage_logs_archive
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON public.usage_logs_backup FROM anon, authenticated;
REVOKE ALL ON public.usage_logs_archive FROM anon, authenticated;

-- ============================================
-- STEP 7: 최종 삭제 (모든 검증 완료 후 실행!)
-- ============================================
-- 주의: 아래 명령은 주석을 해제하고 신중하게 실행하세요

/*
-- usage_logs 테이블 삭제
DROP TABLE IF EXISTS public.usage_logs CASCADE;

-- 6개월 이상 된 일별 통계 삭제 (월별 통계로 대체)
DELETE FROM public.user_daily_stats
WHERE date < CURRENT_DATE - INTERVAL '6 months'
  AND EXISTS (
    SELECT 1 FROM public.user_monthly_stats m
    WHERE m.user_email = user_daily_stats.user_email
      AND m.month = DATE_TRUNC('month', user_daily_stats.date)
  );

-- 테이블 VACUUM으로 공간 회수
VACUUM FULL public.user_daily_stats;
VACUUM FULL public.daily_stats;
*/

-- ============================================
-- STEP 8: 정리 후 상태 확인
-- ============================================

-- 최종 테이블 크기 및 상태
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_daily_stats', 
    'user_monthly_stats',
    'usage_logs_backup',
    'usage_logs_archive',
    'daily_stats'
  )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;