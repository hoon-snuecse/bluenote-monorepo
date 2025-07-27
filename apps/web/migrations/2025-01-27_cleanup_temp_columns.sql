-- 임시 컬럼 제거
ALTER TABLE public.user_permissions DROP COLUMN IF EXISTS _temp_refresh;
ALTER TABLE public.usage_logs DROP COLUMN IF EXISTS _temp_refresh;

-- 정리 완료 확인
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('user_permissions', 'usage_logs')
AND column_name = '_temp_refresh';