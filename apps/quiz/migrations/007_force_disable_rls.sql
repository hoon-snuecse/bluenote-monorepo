-- 모든 테이블의 현재 RLS 상태 확인
SELECT 
    schemaname,
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS가 활성화되어 있습니다 - 비활성화 필요!'
        ELSE 'RLS가 비활성화되어 있습니다'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
ORDER BY tablename;

-- 강제로 RLS 비활성화 및 모든 정책 삭제
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- quizzes 테이블
    ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quizzes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.quizzes', pol.policyname);
    END LOOP;
    
    -- questions 테이블  
    ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'questions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.questions', pol.policyname);
    END LOOP;
    
    -- question_options 테이블
    ALTER TABLE public.question_options DISABLE ROW LEVEL SECURITY;
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'question_options'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.question_options', pol.policyname);
    END LOOP;
    
    -- shared_quizzes 테이블
    ALTER TABLE public.shared_quizzes DISABLE ROW LEVEL SECURITY;
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shared_quizzes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.shared_quizzes', pol.policyname);
    END LOOP;
END $$;

-- 다시 확인
SELECT 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '❌ 여전히 활성화됨'
        ELSE '✅ 비활성화됨'
    END as final_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
ORDER BY tablename;