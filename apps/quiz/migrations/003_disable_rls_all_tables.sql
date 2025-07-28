-- Quiz 앱의 모든 테이블에 대해 RLS 비활성화
-- 이 마이그레이션은 개발 중 임시로 사용되며, 프로덕션 전에는 적절한 RLS 정책으로 교체해야 합니다.

-- 1. 모든 Quiz 앱 관련 테이블의 RLS 비활성화
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quiz_stats DISABLE ROW LEVEL SECURITY;

-- 2. 기존 정책들 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can read their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can insert their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON quizzes;

DROP POLICY IF EXISTS "Anyone can read questions" ON questions;
DROP POLICY IF EXISTS "Users can insert questions" ON questions;
DROP POLICY IF EXISTS "Users can update questions" ON questions;
DROP POLICY IF EXISTS "Users can delete questions" ON questions;

DROP POLICY IF EXISTS "Anyone can read question options" ON question_options;
DROP POLICY IF EXISTS "Users can insert question options" ON question_options;
DROP POLICY IF EXISTS "Users can update question options" ON question_options;
DROP POLICY IF EXISTS "Users can delete question options" ON question_options;

DROP POLICY IF EXISTS "Anyone can read shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can share their quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can update their shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can delete their shared quizzes" ON shared_quizzes;

-- 3. 확인을 위한 쿼리 (주석 처리됨, 필요시 실행)
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes', 'quiz_downloads', 'quiz_ratings', 'quiz_likes', 'quiz_activity_logs', 'daily_quiz_stats');