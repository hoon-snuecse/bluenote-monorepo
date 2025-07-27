-- RLS 강제 새로고침을 위한 트릭
-- 테이블 구조를 살짝 변경했다가 되돌리기

-- 1. 임시 컬럼 추가 (구조 변경으로 캐시 무효화)
ALTER TABLE public.user_permissions ADD COLUMN IF NOT EXISTS _temp_refresh BOOLEAN DEFAULT false;
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS _temp_refresh BOOLEAN DEFAULT false;

-- 2. PostgREST에 스키마 변경 알림
NOTIFY pgrst, 'reload schema';

-- 3. 잠시 대기 후 컬럼 제거 (별도로 실행)
-- ALTER TABLE public.user_permissions DROP COLUMN IF EXISTS _temp_refresh;
-- ALTER TABLE public.usage_logs DROP COLUMN IF EXISTS _temp_refresh;