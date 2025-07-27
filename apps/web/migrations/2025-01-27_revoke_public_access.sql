-- 더 강력한 방법: REVOKE로 테이블 접근 권한 제거

-- 1. PUBLIC 역할에서 모든 권한 제거
REVOKE ALL ON TABLE public.user_permissions FROM PUBLIC;
REVOKE ALL ON TABLE public.usage_logs FROM PUBLIC;

-- 2. anon 역할에서 모든 권한 제거 
REVOKE ALL ON TABLE public.user_permissions FROM anon;
REVOKE ALL ON TABLE public.usage_logs FROM anon;

-- 3. authenticated 역할에서 모든 권한 제거
REVOKE ALL ON TABLE public.user_permissions FROM authenticated;
REVOKE ALL ON TABLE public.usage_logs FROM authenticated;

-- 4. postgres(소유자)와 service_role에게만 권한 부여
GRANT ALL ON TABLE public.user_permissions TO postgres;
GRANT ALL ON TABLE public.user_permissions TO service_role;
GRANT ALL ON TABLE public.usage_logs TO postgres;
GRANT ALL ON TABLE public.usage_logs TO service_role;

-- 5. 권한 확인
-- SELECT 
--     grantee,
--     table_name,
--     privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_name IN ('user_permissions', 'usage_logs')
-- AND table_schema = 'public'
-- ORDER BY table_name, grantee;