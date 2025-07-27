-- Phase 1: 가장 민감한 테이블 즉시 보호
-- 실행 시간: 2025-01-27
-- 목적: user_permissions와 usage_logs 테이블의 민감한 데이터 보호

-- ========================================
-- 1. RLS 활성화 (보안 문지기 배치)
-- ========================================
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. 완전 차단 정책 생성
-- ========================================
-- user_permissions: 모든 접근 차단
CREATE POLICY "Block all public access to user_permissions" 
    ON public.user_permissions
    FOR ALL 
    USING (false);  -- false = 아무도 접근 불가

-- usage_logs: 모든 접근 차단
CREATE POLICY "Block all public access to usage_logs" 
    ON public.usage_logs
    FOR ALL 
    USING (false);  -- false = 아무도 접근 불가

-- ========================================
-- 3. 정책 설명 추가 (문서화)
-- ========================================
COMMENT ON POLICY "Block all public access to user_permissions" ON public.user_permissions 
    IS 'Phase 1 보안 - 민감한 사용자 권한 정보 완전 차단 (2025-01-27)';

COMMENT ON POLICY "Block all public access to usage_logs" ON public.usage_logs 
    IS 'Phase 1 보안 - 사용자 활동 로그 완전 차단 (2025-01-27)';

-- ========================================
-- 실행 후 확인 쿼리
-- ========================================
-- 다음 쿼리로 RLS가 제대로 활성화되었는지 확인:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('user_permissions', 'usage_logs');