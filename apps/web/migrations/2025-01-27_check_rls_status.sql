-- RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = 'true' THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts', 'user_permissions', 'usage_logs')
ORDER BY tablename;

-- RLS가 활성화되어 있다면 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts')
ORDER BY tablename, policyname;