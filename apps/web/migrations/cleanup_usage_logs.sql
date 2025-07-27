-- usage_logs 테이블 정리 스크립트
-- 주의: 백업이 완료되었는지 반드시 확인 후 실행하세요!

-- 1. 최종 백업 확인
WITH final_check AS (
  SELECT 
    (SELECT COUNT(*) FROM public.usage_logs) as original_count,
    (SELECT COUNT(*) FROM public.usage_logs_backup) as backup_count,
    (SELECT MAX(created_at) FROM public.usage_logs) as original_latest,
    (SELECT MAX(created_at) FROM public.usage_logs_backup) as backup_latest
)
SELECT 
  original_count,
  backup_count,
  original_latest,
  backup_latest,
  CASE 
    WHEN original_count = backup_count AND original_latest = backup_latest 
    THEN '✅ 백업 완료 - 삭제 가능'
    ELSE '❌ 백업 불완전 - 삭제 중단'
  END as status
FROM final_check;

-- 2. usage_logs 테이블과 관련된 객체들 확인
SELECT 
  'Indexes' as object_type,
  indexname as object_name
FROM pg_indexes
WHERE tablename = 'usage_logs' AND schemaname = 'public'

UNION ALL

SELECT 
  'Policies' as object_type,
  policyname as object_name
FROM pg_policies
WHERE tablename = 'usage_logs' AND schemaname = 'public'

UNION ALL

SELECT 
  'Triggers' as object_type,
  tgname as object_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'usage_logs';

-- 3. 테이블 삭제 (주석을 해제하여 실행)
-- 주의: 위의 백업 확인이 '✅ 백업 완료' 상태일 때만 실행하세요!

/*
-- usage_logs 테이블 삭제 (CASCADE로 관련 객체도 함께 삭제)
DROP TABLE IF EXISTS public.usage_logs CASCADE;

-- 삭제 확인
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs')
    THEN '✅ usage_logs 테이블이 성공적으로 삭제되었습니다'
    ELSE '❌ 삭제 실패'
  END as deletion_status;
*/

-- 4. 정리 후 상태 확인
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size('public.' || table_name)) as size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name LIKE '%log%' OR table_name LIKE '%stats%')
ORDER BY pg_total_relation_size('public.' || table_name) DESC;

-- 5. 디스크 공간 회수 (선택사항)
-- VACUUM FULL은 테이블 락을 걸므로 주의해서 사용
/*
VACUUM FULL public.user_daily_stats;
VACUUM FULL public.daily_stats;
VACUUM ANALYZE;
*/