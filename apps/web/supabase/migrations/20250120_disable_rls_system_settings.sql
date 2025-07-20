-- 1. RLS 비활성화
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

-- 2. 모든 정책 삭제
DROP POLICY IF EXISTS "Admins can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON system_settings;
DROP POLICY IF EXISTS "Service role bypass" ON system_settings;

-- 3. 기본 행 확인 및 생성
INSERT INTO system_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- 4. 권한 확인
GRANT ALL ON system_settings TO authenticated;
GRANT ALL ON system_settings TO service_role;
GRANT ALL ON system_settings TO anon;

-- 5. 테이블 상태 확인
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class
WHERE relname = 'system_settings';

-- 6. 테이블 내용 확인
SELECT * FROM system_settings;