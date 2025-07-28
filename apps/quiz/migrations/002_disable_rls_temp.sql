-- 임시로 RLS 비활성화 (개발 중)
-- 프로덕션에서는 RLS를 다시 활성화해야 합니다!

ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_exports DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_stats DISABLE ROW LEVEL SECURITY;

-- 또는 정책을 더 간단하게 수정
-- 모든 로그인한 사용자가 자신의 데이터에 접근 가능하도록

-- DROP POLICY IF EXISTS "Users can view own quizzes" ON quizzes;
-- DROP POLICY IF EXISTS "Users can create own quizzes" ON quizzes;
-- DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
-- DROP POLICY IF EXISTS "Users can delete own quizzes" ON quizzes;

-- CREATE POLICY "Enable all for authenticated users" ON quizzes
--   FOR ALL 
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);