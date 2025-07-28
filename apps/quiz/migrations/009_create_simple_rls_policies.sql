-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Anyone can insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can read quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can delete quizzes" ON public.quizzes;

DROP POLICY IF EXISTS "Anyone can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can read questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can update questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can delete questions" ON public.questions;

DROP POLICY IF EXISTS "Anyone can insert question_options" ON public.question_options;
DROP POLICY IF EXISTS "Anyone can read question_options" ON public.question_options;
DROP POLICY IF EXISTS "Anyone can update question_options" ON public.question_options;
DROP POLICY IF EXISTS "Anyone can delete question_options" ON public.question_options;

DROP POLICY IF EXISTS "Anyone can insert shared_quizzes" ON public.shared_quizzes;
DROP POLICY IF EXISTS "Anyone can read shared_quizzes" ON public.shared_quizzes;
DROP POLICY IF EXISTS "Anyone can update shared_quizzes" ON public.shared_quizzes;
DROP POLICY IF EXISTS "Anyone can delete shared_quizzes" ON public.shared_quizzes;

-- RLS 활성화
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_quizzes ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자에게 전체 권한 부여 (임시)
CREATE POLICY "Authenticated users full access on quizzes" ON public.quizzes
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access on questions" ON public.questions
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access on question_options" ON public.question_options
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access on shared_quizzes" ON public.shared_quizzes
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 확인
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes')
ORDER BY tablename, policyname;