-- RLS 정책 종합 점검 스크립트
-- 각 테이블의 RLS 상태와 정책을 확인합니다

-- 1. RLS가 활성화된 테이블 목록
SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✅ 활성화' ELSE '❌ 비활성화' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_permissions', 
    'usage_logs', 
    'user_daily_stats',
    'daily_stats',
    'research_posts',
    'teaching_posts',
    'analytics_posts',
    'shed_posts'
  )
ORDER BY tablename;

-- 2. 각 테이블의 RLS 정책 상세
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as "명령",
  qual as "USING 조건",
  with_check as "WITH CHECK 조건",
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_permissions', 
    'usage_logs', 
    'user_daily_stats',
    'daily_stats',
    'research_posts',
    'teaching_posts',
    'analytics_posts',
    'shed_posts'
  )
ORDER BY tablename, policyname;

-- 3. 각 테이블의 권한 설정
SELECT 
  n.nspname as schema,
  c.relname as table,
  a.rolname as grantee,
  string_agg(p.privilege_type, ', ' ORDER BY p.privilege_type) as privileges
FROM information_schema.table_privileges p
JOIN pg_class c ON (c.relname = p.table_name)
JOIN pg_namespace n ON (n.nspname = p.table_schema AND c.relnamespace = n.oid)
JOIN pg_authid a ON (a.rolname = p.grantee)
WHERE n.nspname = 'public'
  AND c.relname IN (
    'user_permissions', 
    'usage_logs', 
    'user_daily_stats',
    'daily_stats',
    'research_posts',
    'teaching_posts',
    'analytics_posts',
    'shed_posts'
  )
  AND a.rolname IN ('anon', 'authenticated', 'service_role')
GROUP BY n.nspname, c.relname, a.rolname
ORDER BY c.relname, a.rolname;

-- 4. 민감한 테이블의 보안 상태 요약
WITH security_status AS (
  SELECT 
    t.tablename,
    CASE WHEN t.rowsecurity THEN 1 ELSE 0 END as rls_enabled,
    COUNT(p.policyname) as policy_count,
    BOOL_OR(tp.grantee = 'anon') as anon_access,
    BOOL_OR(tp.grantee = 'authenticated') as auth_access,
    BOOL_OR(tp.grantee = 'service_role') as service_access
  FROM pg_tables t
  LEFT JOIN pg_policies p ON (t.schemaname = p.schemaname AND t.tablename = p.tablename)
  LEFT JOIN information_schema.table_privileges tp ON (t.schemaname = tp.table_schema AND t.tablename = tp.table_name)
  WHERE t.schemaname = 'public'
    AND t.tablename IN ('user_permissions', 'usage_logs', 'user_daily_stats')
  GROUP BY t.tablename, t.rowsecurity
)
SELECT 
  tablename as "테이블",
  CASE WHEN rls_enabled = 1 THEN '✅' ELSE '❌' END as "RLS",
  policy_count as "정책수",
  CASE WHEN anon_access THEN '⚠️ 있음' ELSE '✅ 없음' END as "Anon 접근",
  CASE WHEN auth_access THEN '⚠️ 있음' ELSE '✅ 없음' END as "Auth 접근",
  CASE WHEN service_access THEN '✅ 있음' ELSE '❌ 없음' END as "Service 접근",
  CASE 
    WHEN rls_enabled = 1 AND NOT anon_access AND NOT auth_access AND service_access THEN '🔒 안전'
    WHEN rls_enabled = 1 AND (anon_access OR auth_access) THEN '⚠️ 주의필요'
    ELSE '❌ 위험'
  END as "보안상태"
FROM security_status
ORDER BY 
  CASE 
    WHEN tablename = 'user_permissions' THEN 1
    WHEN tablename = 'usage_logs' THEN 2
    ELSE 3
  END;

-- 5. Service Role이 접근 가능한 모든 테이블
SELECT 
  table_schema,
  table_name,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.table_privileges
WHERE grantee = 'service_role'
  AND table_schema = 'public'
GROUP BY table_schema, table_name
ORDER BY table_name;