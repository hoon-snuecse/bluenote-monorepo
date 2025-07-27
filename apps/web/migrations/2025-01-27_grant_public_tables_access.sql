-- 공개 테이블들에 대한 Service Role 권한 부여
-- 이 테이블들은 공개 콘텐츠이므로 보안상 덜 민감함

-- 1. research_posts 테이블
GRANT ALL ON TABLE public.research_posts TO service_role;
GRANT ALL ON TABLE public.research_posts TO postgres;

-- 2. shed_posts 테이블  
GRANT ALL ON TABLE public.shed_posts TO service_role;
GRANT ALL ON TABLE public.shed_posts TO postgres;

-- 3. teaching_posts 테이블
GRANT ALL ON TABLE public.teaching_posts TO service_role;
GRANT ALL ON TABLE public.teaching_posts TO postgres;

-- 4. analytics_posts 테이블
GRANT ALL ON TABLE public.analytics_posts TO service_role;
GRANT ALL ON TABLE public.analytics_posts TO postgres;

-- 5. 권한 확인 쿼리
SELECT 
    grantee,
    table_name,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.role_table_grants
WHERE table_name IN ('research_posts', 'shed_posts', 'teaching_posts', 'analytics_posts')
AND table_schema = 'public'
GROUP BY grantee, table_name
ORDER BY table_name, grantee;