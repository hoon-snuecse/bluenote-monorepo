-- 1. 테이블별 권한 상세 확인
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name IN ('research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts')
AND grantee IN ('anon', 'authenticated', 'service_role', 'postgres')
ORDER BY table_name, grantee, privilege_type;

-- 2. Service Role이 실제로 가지고 있는 role 확인
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin,
    rolreplication,
    rolbypassrls
FROM pg_roles
WHERE rolname IN ('anon', 'authenticated', 'service_role', 'postgres');

-- 3. Role 상속 관계 확인
SELECT 
    r1.rolname as role,
    r2.rolname as member_of
FROM pg_auth_members m
JOIN pg_roles r1 ON m.member = r1.oid
JOIN pg_roles r2 ON m.roleid = r2.oid
WHERE r1.rolname IN ('service_role', 'anon', 'authenticated');

-- 4. 테이블 소유자 확인
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    pg_get_userbyid(c.relowner) as owner
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname IN ('research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts')
AND c.relkind = 'r';

-- 5. 시퀀스 권한 확인 (ID 컬럼 관련)
SELECT 
    schemaname,
    sequencename,
    sequenceowner
FROM pg_sequences
WHERE schemaname = 'public'
AND sequencename LIKE '%posts%';