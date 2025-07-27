-- 간단한 테이블 확인 스크립트

-- 1. 현재 존재하는 테이블 목록
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%log%' 
     OR table_name LIKE '%stats%'
     OR table_name LIKE '%backup%'
ORDER BY table_name;

-- 2. usage_logs 테이블 상태 (존재하는 경우만)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs') THEN
    RAISE NOTICE 'usage_logs 테이블 존재함';
  ELSE
    RAISE NOTICE 'usage_logs 테이블이 없습니다';
  END IF;
END $$;

-- 3. 각 테이블 레코드 수 (동적 쿼리)
DO $$
DECLARE
  tbl_name text;
  row_cnt bigint;
BEGIN
  FOR tbl_name IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('usage_logs', 'user_daily_stats', 'daily_stats', 'usage_logs_backup')
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl_name) INTO row_cnt;
    RAISE NOTICE '% 테이블: % 행', tbl_name, row_cnt;
  END LOOP;
END $$;

-- 4. 백업이 필요한지 확인
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs_backup')
    THEN '⚠️ usage_logs 테이블은 있지만 백업이 없습니다. 백업을 먼저 생성하세요!'
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs_backup')
    THEN '✅ 백업 테이블이 이미 존재합니다'
    ELSE '✅ usage_logs 테이블이 이미 삭제되었습니다'
  END as backup_status;