-- RLS 완전 수정: 모든 역할 차단 후 Service Role만 허용

-- 1. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Only service role can access user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Only service role can access usage_logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Admin can read user_permissions" ON public.user_permissions;

-- 2. 기본 차단 정책 (모든 역할에 대해)
-- user_permissions: 기본적으로 모두 차단
CREATE POLICY "Default deny all on user_permissions" 
    ON public.user_permissions
    FOR ALL 
    USING (false);

-- usage_logs: 기본적으로 모두 차단
CREATE POLICY "Default deny all on usage_logs" 
    ON public.usage_logs
    FOR ALL 
    USING (false);

-- 3. Service Role 예외 정책
-- user_permissions: Service Role만 허용
CREATE POLICY "Service role bypass for user_permissions" 
    ON public.user_permissions
    FOR ALL 
    TO service_role
    USING (true);

-- usage_logs: Service Role만 허용
CREATE POLICY "Service role bypass for usage_logs" 
    ON public.usage_logs
    FOR ALL 
    TO service_role
    USING (true);

-- 4. 관리자 읽기 권한 (authenticated 역할에만)
CREATE POLICY "Admin read user_permissions" 
    ON public.user_permissions
    FOR SELECT 
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM public.user_permissions 
            WHERE role = 'admin'
        )
    );

-- 5. 정책 확인
-- SELECT 
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual
-- FROM pg_policies
-- WHERE tablename IN ('user_permissions', 'usage_logs')
-- ORDER BY tablename, policyname;