-- 테이블 크기 확인 (간단한 버전)

-- 방법 1: pg_class를 사용한 테이블 크기 확인
SELECT 
  c.relname as table_name,
  pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
  pg_size_pretty(pg_relation_size(c.oid)) as table_size,
  pg_size_pretty(pg_indexes_size(c.oid)) as indexes_size,
  c.reltuples::bigint as estimated_rows
FROM pg_class c
INNER JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('usage_logs', 'user_daily_stats', 'daily_stats', 'usage_logs_backup')
  AND c.relkind = 'r'
ORDER BY pg_total_relation_size(c.oid) DESC;

-- 방법 2: information_schema를 사용한 테이블 목록
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('usage_logs', 'user_daily_stats', 'daily_stats', 'usage_logs_backup')
ORDER BY table_name;

-- 방법 3: 각 테이블의 레코드 수 확인 (존재하는 테이블만)
WITH table_counts AS (
  SELECT 'usage_logs' as table_name, COUNT(*) as row_count 
  FROM public.usage_logs
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs')
  
  UNION ALL
  
  SELECT 'user_daily_stats', COUNT(*) 
  FROM public.user_daily_stats
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_daily_stats')
  
  UNION ALL
  
  SELECT 'daily_stats', COUNT(*) 
  FROM public.daily_stats
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_stats')
)
SELECT * FROM table_counts
ORDER BY table_name;

-- 백업 테이블 존재 여부 확인
SELECT 
  'usage_logs_backup' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs_backup')
    THEN '✅ 존재'
    ELSE '❌ 미생성'
  END as status;