-- =====================================================
-- Quiz App RLS 비활성화
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: Service Role Key 권한 문제 해결
-- =====================================================

-- Step 1: 모든 기존 정책 제거
-- -----------------------------------------------------
DROP POLICY IF EXISTS "API access only" ON quizzes;
DROP POLICY IF EXISTS "API access only" ON questions;
DROP POLICY IF EXISTS "API access only" ON question_options;
DROP POLICY IF EXISTS "API access only" ON shared_quizzes;
DROP POLICY IF EXISTS "API access only" ON quiz_downloads;
DROP POLICY IF EXISTS "API access only" ON quiz_ratings;

-- 기타 남아있을 수 있는 정책들도 제거
DROP POLICY IF EXISTS "Users can create own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can view accessible quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON quizzes;

DROP POLICY IF EXISTS "Users can create questions for own quizzes" ON questions;
DROP POLICY IF EXISTS "Users can view questions of accessible quizzes" ON questions;
DROP POLICY IF EXISTS "Users can update questions of own quizzes" ON questions;
DROP POLICY IF EXISTS "Users can delete questions of own quizzes" ON questions;
DROP POLICY IF EXISTS "Users can insert own questions" ON questions;
DROP POLICY IF EXISTS "Users can delete own questions" ON questions;
DROP POLICY IF EXISTS "Users can update own questions" ON questions;
DROP POLICY IF EXISTS "Users can view accessible questions" ON questions;

DROP POLICY IF EXISTS "Users can create options for own questions" ON question_options;
DROP POLICY IF EXISTS "Users can view options of accessible questions" ON question_options;
DROP POLICY IF EXISTS "Users can update options of own questions" ON question_options;
DROP POLICY IF EXISTS "Users can delete options of own questions" ON question_options;
DROP POLICY IF EXISTS "Users can insert options for their questions" ON question_options;
DROP POLICY IF EXISTS "Users can delete options for their questions" ON question_options;
DROP POLICY IF EXISTS "Users can update options for their questions" ON question_options;
DROP POLICY IF EXISTS "Users can view accessible question options" ON question_options;

DROP POLICY IF EXISTS "Users can create shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Public can view shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can update own shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can delete own shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Anyone can view shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can create own shared quizzes" ON shared_quizzes;

DROP POLICY IF EXISTS "Users can create download records" ON quiz_downloads;
DROP POLICY IF EXISTS "Users can view own download records" ON quiz_downloads;
DROP POLICY IF EXISTS "Users can record downloads" ON quiz_downloads;
DROP POLICY IF EXISTS "Users can view own downloads" ON quiz_downloads;

DROP POLICY IF EXISTS "Users can rate shared quizzes" ON quiz_ratings;
DROP POLICY IF EXISTS "Users can view quiz ratings" ON quiz_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON quiz_ratings;
DROP POLICY IF EXISTS "Users can create own ratings" ON quiz_ratings;
DROP POLICY IF EXISTS "Users can view all ratings" ON quiz_ratings;

-- Step 2: RLS 비활성화 (Web 앱과 동일한 방식)
-- -----------------------------------------------------
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_quizzes DISABLE ROW LEVEL SECURITY;

-- 다른 테이블들도 확인 및 비활성화
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_downloads' AND schemaname = 'public') THEN
    ALTER TABLE quiz_downloads DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_ratings' AND schemaname = 'public') THEN
    ALTER TABLE quiz_ratings DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Step 3: 확인 쿼리
-- -----------------------------------------------------
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes', 'quiz_downloads', 'quiz_ratings')
  AND schemaname = 'public'
ORDER BY tablename;

-- 예상 결과: 모든 테이블의 rowsecurity가 false여야 함