-- usage_logs 테이블 최종 삭제 스크립트
-- 실행일: 2025-07-27

-- 1. 삭제 전 최종 확인
SELECT 
  'usage_logs' as table_name,
  COUNT(*) as record_count,
  pg_size_pretty(pg_total_relation_size('public.usage_logs')) as table_size,
  '즉시 삭제 예정' as status
FROM public.usage_logs;

-- 2. usage_logs 테이블 삭제
DROP TABLE IF EXISTS public.usage_logs CASCADE;

-- 3. 삭제 확인
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_logs')
    THEN '✅ usage_logs 테이블이 성공적으로 삭제되었습니다'
    ELSE '❌ 삭제 실패'
  END as deletion_status;

-- 4. 남은 테이블 목록 및 크기
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

-- 5. 공간 회수를 위한 VACUUM (선택사항)
-- 시스템 부하가 적을 때 실행 권장
VACUUM ANALYZE;