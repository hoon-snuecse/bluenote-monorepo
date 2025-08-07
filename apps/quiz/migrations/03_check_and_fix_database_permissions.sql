-- =====================================================
-- Quiz App 데이터베이스 권한 문제 디버깅 및 수정
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: RLS 비활성화 후에도 발생하는 permission denied 문제 해결
-- =====================================================

-- Step 1: 현재 사용자 및 권한 확인
-- -----------------------------------------------------
SELECT current_user, session_user;

-- Step 2: ANON 역할의 테이블 권한 확인
-- -----------------------------------------------------
SELECT 
    table_schema,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges
WHERE table_name IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
    AND table_schema = 'public'
    AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- Step 3: authenticated 역할에 필요한 권한 부여 (가장 중요!)
-- -----------------------------------------------------
-- authenticated 사용자에게 모든 CRUD 권한 부여
GRANT ALL ON TABLE public.quizzes TO authenticated;
GRANT ALL ON TABLE public.questions TO authenticated;
GRANT ALL ON TABLE public.question_options TO authenticated;
GRANT ALL ON TABLE public.shared_quizzes TO authenticated;

-- quiz_downloads와 quiz_ratings 테이블도 있다면 권한 부여
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_downloads' AND schemaname = 'public') THEN
    EXECUTE 'GRANT ALL ON TABLE public.quiz_downloads TO authenticated';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_ratings' AND schemaname = 'public') THEN
    EXECUTE 'GRANT ALL ON TABLE public.quiz_ratings TO authenticated';
  END IF;
END $$;

-- 시퀀스 권한도 부여 (ID 생성을 위해)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 향후 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Step 4: ANON 역할에도 동일한 권한 부여 (이미 있지만 확실히)
-- -----------------------------------------------------
GRANT ALL ON TABLE public.quizzes TO anon;
GRANT ALL ON TABLE public.questions TO anon;
GRANT ALL ON TABLE public.question_options TO anon;
GRANT ALL ON TABLE public.shared_quizzes TO anon;

-- quiz_downloads와 quiz_ratings 테이블도 있다면 권한 부여
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_downloads' AND schemaname = 'public') THEN
    EXECUTE 'GRANT ALL ON TABLE public.quiz_downloads TO anon';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_ratings' AND schemaname = 'public') THEN
    EXECUTE 'GRANT ALL ON TABLE public.quiz_ratings TO anon';
  END IF;
END $$;

-- 시퀀스 권한도 부여 (ID 생성을 위해)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 향후 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO anon;

-- Step 5: 권한 변경 후 재확인
-- -----------------------------------------------------
SELECT 
    table_schema,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges
WHERE table_name IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
    AND table_schema = 'public'
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- Step 6: RLS 상태 최종 확인
-- -----------------------------------------------------
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
    AND schemaname = 'public'
ORDER BY tablename;

-- 예상 결과:
-- 1. 모든 테이블의 rowsecurity = false
-- 2. anon과 authenticated 역할이 INSERT, SELECT, UPDATE, DELETE 권한 보유