-- =====================================================
-- Quiz App RLS 정책 재설정 - API Only 패턴
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: RLS 경고 제거 및 API 전용 접근 설정
-- =====================================================

-- Step 1: 기존 정책들 모두 제거
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Users can create own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can view accessible quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON quizzes;

DROP POLICY IF EXISTS "Users can create questions for own quizzes" ON questions;
DROP POLICY IF EXISTS "Users can view questions of accessible quizzes" ON questions;
DROP POLICY IF EXISTS "Users can update questions of own quizzes" ON questions;
DROP POLICY IF EXISTS "Users can delete questions of own quizzes" ON questions;

DROP POLICY IF EXISTS "Users can create options for own questions" ON question_options;
DROP POLICY IF EXISTS "Users can view options of accessible questions" ON question_options;
DROP POLICY IF EXISTS "Users can update options of own questions" ON question_options;
DROP POLICY IF EXISTS "Users can delete options of own questions" ON question_options;

DROP POLICY IF EXISTS "Users can create shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Public can view shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can update own shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can delete own shared quizzes" ON shared_quizzes;

-- Step 2: RLS는 활성화 상태 유지 (보안 경고 방지)
-- -----------------------------------------------------
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_quizzes ENABLE ROW LEVEL SECURITY;

-- Step 3: API 전용 정책 추가 (모든 직접 접근 차단)
-- -----------------------------------------------------
-- 이 정책들은 항상 false를 반환하여 직접 DB 접근을 차단합니다.
-- Service Role Key를 사용하는 API만 접근 가능합니다.

CREATE POLICY "API access only" ON quizzes 
  FOR ALL 
  USING (false)
  WITH CHECK (false);

CREATE POLICY "API access only" ON questions 
  FOR ALL 
  USING (false)
  WITH CHECK (false);

CREATE POLICY "API access only" ON question_options 
  FOR ALL 
  USING (false)
  WITH CHECK (false);

CREATE POLICY "API access only" ON shared_quizzes 
  FOR ALL 
  USING (false)
  WITH CHECK (false);

-- Step 4: 다른 관련 테이블들도 동일하게 처리
-- -----------------------------------------------------
-- quiz_downloads 테이블 확인 및 처리
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_downloads' AND schemaname = 'public') THEN
    ALTER TABLE quiz_downloads ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can create download records" ON quiz_downloads;
    DROP POLICY IF EXISTS "Users can view own download records" ON quiz_downloads;
    CREATE POLICY "API access only" ON quiz_downloads FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;

-- quiz_ratings 테이블 확인 및 처리
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quiz_ratings' AND schemaname = 'public') THEN
    ALTER TABLE quiz_ratings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can rate shared quizzes" ON quiz_ratings;
    DROP POLICY IF EXISTS "Users can view quiz ratings" ON quiz_ratings;
    DROP POLICY IF EXISTS "Users can update own ratings" ON quiz_ratings;
    CREATE POLICY "API access only" ON quiz_ratings FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;

-- Step 5: 확인 쿼리
-- -----------------------------------------------------
-- 이 쿼리를 실행하여 정책이 올바르게 설정되었는지 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('quizzes', 'questions', 'question_options', 'shared_quizzes', 'quiz_downloads', 'quiz_ratings')
ORDER BY tablename, policyname;

-- 예상 결과: 각 테이블마다 "API access only" 정책만 있어야 함