-- daily_stats 테이블 권한 수정

-- 1. RLS 비활성화 확인
ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;

-- 2. 익명 사용자(anon)에게 읽기 권한 부여
GRANT SELECT ON daily_stats TO anon;

-- 3. 인증된 사용자(authenticated)에게 읽기 권한 부여
GRANT SELECT ON daily_stats TO authenticated;

-- 4. service_role에게 모든 권한 부여
GRANT ALL ON daily_stats TO service_role;

-- 5. 시퀀스에 대한 권한도 부여 (ID 자동 증가용)
GRANT USAGE ON SEQUENCE daily_stats_id_seq TO anon, authenticated, service_role;

-- 권한 확인 쿼리
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'daily_stats';