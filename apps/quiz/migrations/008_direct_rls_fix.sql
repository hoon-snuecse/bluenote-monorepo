-- 1. 현재 RLS 상태와 정책 확인
SELECT 
    t.tablename,
    t.rowsecurity as "RLS 활성화",
    COUNT(p.policyname) as "정책 수"
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public' 
AND t.tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- 2. 모든 정책 확인
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes');

-- 3. RLS 비활성화 (이미 비활성화되어 있어도 안전하게 실행)
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_quizzes DISABLE ROW LEVEL SECURITY;

-- 4. 모든 정책 개별적으로 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quizzes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.quizzes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.quizzes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;

-- 5. 권한 확인 (superuser나 owner가 아닌 경우 문제일 수 있음)
SELECT 
    current_user,
    has_table_privilege(current_user, 'public.quizzes', 'INSERT') as can_insert,
    has_table_privilege(current_user, 'public.quizzes', 'SELECT') as can_select,
    has_table_privilege(current_user, 'public.quizzes', 'UPDATE') as can_update,
    has_table_privilege(current_user, 'public.quizzes', 'DELETE') as can_delete;