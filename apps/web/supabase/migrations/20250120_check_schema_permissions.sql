-- 1. 현재 사용자 확인
SELECT current_user, session_user;

-- 2. public 스키마 권한 확인
SELECT 
    nspname as schema_name,
    nspacl as permissions
FROM pg_namespace
WHERE nspname = 'public';

-- 3. 테이블 소유자 확인
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'system_settings';

-- 4. 현재 역할의 권한 확인
SELECT 
    rolname,
    rolsuper,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles
WHERE rolname = current_user;

-- 5. public 스키마에 대한 권한 부여 (superuser로 실행 필요)
GRANT CREATE ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;