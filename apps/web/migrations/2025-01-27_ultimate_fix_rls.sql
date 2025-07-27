-- RLS 최종 수정: RESTRICTIVE 정책 사용

-- 1. 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Default deny all on user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Service role bypass for user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admin read user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Default deny all on usage_logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Service role bypass for usage_logs" ON public.usage_logs;

-- 2. RESTRICTIVE 정책으로 완전 차단 (이것이 먼저 적용됨)
CREATE POLICY "Block everyone on user_permissions" 
    ON public.user_permissions
    AS RESTRICTIVE
    FOR ALL 
    USING (false);

CREATE POLICY "Block everyone on usage_logs" 
    ON public.usage_logs
    AS RESTRICTIVE
    FOR ALL 
    USING (false);

-- 3. Service Role만 허용하는 PERMISSIVE 정책
CREATE POLICY "Allow service role on user_permissions" 
    ON public.user_permissions
    AS PERMISSIVE
    FOR ALL 
    USING (
        auth.jwt() ->> 'role' = 'service_role'
        OR 
        current_setting('request.jwt.claim.role', true) = 'service_role'
    );

CREATE POLICY "Allow service role on usage_logs" 
    ON public.usage_logs
    AS PERMISSIVE
    FOR ALL 
    USING (
        auth.jwt() ->> 'role' = 'service_role'
        OR 
        current_setting('request.jwt.claim.role', true) = 'service_role'
    );

-- 4. 확인
-- Anon Key로는 접근 불가, Service Role로만 접근 가능해야 함