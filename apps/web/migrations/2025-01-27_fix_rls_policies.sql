-- RLS 정책 수정: authenticated 사용자도 차단
-- 문제: 기존 정책이 public 역할에만 적용되어 로그인한 사용자는 여전히 접근 가능

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Block all public access to user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Block all public access to usage_logs" ON public.usage_logs;

-- 2. 새로운 정책: Service Role만 허용
-- user_permissions: Service Role만 접근 가능
CREATE POLICY "Only service role can access user_permissions" 
    ON public.user_permissions
    FOR ALL 
    TO authenticated, anon, public
    USING (auth.role() = 'service_role');

-- usage_logs: Service Role만 접근 가능
CREATE POLICY "Only service role can access usage_logs" 
    ON public.usage_logs
    FOR ALL 
    TO authenticated, anon, public
    USING (auth.role() = 'service_role');

-- 3. 추가로 관리자 읽기 권한 (필요시)
CREATE POLICY "Admin can read user_permissions" 
    ON public.user_permissions
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_permissions up
            WHERE up.email = auth.email()
            AND up.role = 'admin'
        )
    );

-- 4. 확인 쿼리
-- SELECT 
--     tablename,
--     policyname,
--     roles,
--     cmd,
--     qual
-- FROM pg_policies
-- WHERE tablename IN ('user_permissions', 'usage_logs')
-- ORDER BY tablename, policyname;