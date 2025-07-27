-- usage_logs 백업 생성 스크립트
-- 실행 시간: 2025-07-27

-- 1. 백업 테이블 생성
CREATE TABLE IF NOT EXISTS public.usage_logs_backup AS 
SELECT * FROM public.usage_logs;

-- 2. 백업 테이블에 원본과 동일한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_usage_logs_backup_user_email 
ON public.usage_logs_backup(user_email);

CREATE INDEX IF NOT EXISTS idx_usage_logs_backup_created_at 
ON public.usage_logs_backup(created_at);

CREATE INDEX IF NOT EXISTS idx_usage_logs_backup_action_type 
ON public.usage_logs_backup(action_type);

-- 3. 백업 테이블에 설명 코멘트 추가
COMMENT ON TABLE public.usage_logs_backup IS 'usage_logs 테이블의 전체 백업 (생성일: 2025-07-27)';

-- 4. 백업 테이블 RLS 활성화 (보안)
ALTER TABLE public.usage_logs_backup ENABLE ROW LEVEL SECURITY;

-- Service Role만 접근 가능
CREATE POLICY "Service role only" ON public.usage_logs_backup
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 기본 권한 제거
REVOKE ALL ON public.usage_logs_backup FROM anon, authenticated;

-- Service Role에게만 권한 부여
GRANT ALL ON public.usage_logs_backup TO service_role;

-- 5. 백업 검증
WITH backup_check AS (
  SELECT 
    (SELECT COUNT(*) FROM public.usage_logs) as original_count,
    (SELECT COUNT(*) FROM public.usage_logs_backup) as backup_count
)
SELECT 
  original_count,
  backup_count,
  CASE 
    WHEN original_count = backup_count THEN '✅ 백업 성공!'
    ELSE '❌ 백업 실패 - 레코드 수가 일치하지 않습니다'
  END as status,
  pg_size_pretty(pg_total_relation_size('public.usage_logs')) as original_size,
  pg_size_pretty(pg_total_relation_size('public.usage_logs_backup')) as backup_size
FROM backup_check;

-- 6. 백업 테이블 샘플 데이터 확인 (최근 10건)
SELECT 
  id,
  user_email,
  action_type,
  created_at
FROM public.usage_logs_backup
ORDER BY created_at DESC
LIMIT 10;