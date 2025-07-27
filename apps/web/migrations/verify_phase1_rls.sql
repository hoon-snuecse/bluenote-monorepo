-- Phase 1 RLS 적용 확인 스크립트

-- 1. RLS 활성화 상태 확인
SELECT 
    tablename as "테이블명",
    rowsecurity as "RLS 활성화"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_permissions', 'usage_logs');

-- 2. 생성된 정책 확인
SELECT 
    tablename as "테이블명",
    policyname as "정책명",
    permissive as "허용정책",
    cmd as "적용명령"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_permissions', 'usage_logs');

-- 3. 테스트: Anon Key로 접근 시도 (실패해야 정상)
-- 브라우저에서 다음 URL 접속해보기:
-- https://bluenote.site/api/admin/test-direct
-- user_permissions나 usage_logs 접근이 막혀야 함