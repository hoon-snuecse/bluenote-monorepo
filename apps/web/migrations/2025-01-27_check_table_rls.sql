-- 1. 테이블의 RLS 상태 직접 확인
SELECT 
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname IN ('research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts', 'user_permissions', 'usage_logs')
AND c.relkind = 'r'
ORDER BY c.relname;

-- 2. RLS 정책 확인 (RLS가 활성화된 테이블만)
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts')
ORDER BY tablename, policyname;