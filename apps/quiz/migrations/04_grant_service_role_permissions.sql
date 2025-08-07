-- =====================================================
-- Service Role 권한 부여
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: Service Role Key가 있음에도 permission denied 발생하는 문제 해결
-- =====================================================

-- Service Role에 모든 권한 부여 (가장 중요!)
-- Service Role은 RLS를 우회하지만, 테이블 자체에 대한 권한은 필요합니다
GRANT ALL ON TABLE public.quizzes TO service_role;
GRANT ALL ON TABLE public.questions TO service_role;
GRANT ALL ON TABLE public.question_options TO service_role;
GRANT ALL ON TABLE public.shared_quizzes TO service_role;

-- quiz_downloads와 quiz_ratings 테이블도 있다면 권한 부여
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_downloads' AND schemaname = 'public') THEN
    EXECUTE 'GRANT ALL ON TABLE public.quiz_downloads TO service_role';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_ratings' AND schemaname = 'public') THEN
    EXECUTE 'GRANT ALL ON TABLE public.quiz_ratings TO service_role';
  END IF;
END $$;

-- 시퀀스 권한도 부여 (ID 생성을 위해)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 향후 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO service_role;

-- 권한 확인
SELECT 
    n.nspname as schema,
    c.relname as table,
    c.relacl as permissions
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
    AND n.nspname = 'public'
ORDER BY c.relname;

-- 예상 결과: 각 테이블의 ACL에 service_role=arwdDxtm/postgres가 포함되어야 함