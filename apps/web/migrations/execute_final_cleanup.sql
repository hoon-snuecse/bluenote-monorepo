-- usage_logs 테이블 최종 삭제 실행 스크립트
-- 실행일: 2025-07-27

-- 1. 백업 상태 최종 확인
WITH backup_verification AS (
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs_backup')
      THEN '✅ 백업 테이블 존재'
      ELSE '❌ 백업 테이블 없음'
    END as backup_status,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs')
      THEN '⚠️ 원본 테이블 존재'
      ELSE '✅ 원본 테이블 이미 삭제됨'
    END as original_status
)
SELECT * FROM backup_verification;

-- 2. usage_logs 테이블이 존재하는 경우에만 삭제 진행
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs') THEN
    -- 삭제 전 최종 정보 출력
    RAISE NOTICE 'usage_logs 테이블 삭제를 시작합니다.';
    
    -- 테이블 삭제
    DROP TABLE public.usage_logs CASCADE;
    
    RAISE NOTICE '✅ usage_logs 테이블이 성공적으로 삭제되었습니다.';
  ELSE
    RAISE NOTICE '이미 usage_logs 테이블이 삭제되어 있습니다.';
  END IF;
END $$;

-- 3. 삭제 후 상태 확인
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size('public.' || table_name)) as size,
  CASE table_name
    WHEN 'usage_logs_backup' THEN '백업 테이블 (보관)'
    WHEN 'user_daily_stats' THEN '현재 사용 중 (일별 통계)'
    WHEN 'daily_stats' THEN '현재 사용 중 (전체 통계)'
    ELSE '기타'
  END as description
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name LIKE '%log%' OR table_name LIKE '%stats%')
ORDER BY table_name;

-- 4. 통계 업데이트
ANALYZE;

-- 완료 메시지
SELECT '✅ usage_logs 테이블 삭제 및 정리가 완료되었습니다.' as completion_message;