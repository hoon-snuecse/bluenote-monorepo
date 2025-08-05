-- Supabase Auth JWT 기반 RLS 정책 마이그레이션
-- 실행 전 반드시 백업 확인: supabase/migrations/backup_rls_policies.sql

-- ===========================
-- 1. quizzes 테이블 정책 업데이트
-- ===========================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can create own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can view accessible quizzes" ON quizzes;

-- 새 정책 생성 (Supabase Auth JWT 사용)
CREATE POLICY "Users can create own quizzes" ON quizzes
FOR INSERT WITH CHECK (
  user_email = auth.jwt() ->> 'email'
  AND (is_sample = false OR is_sample IS NULL)
);

CREATE POLICY "Users can update own quizzes" ON quizzes
FOR UPDATE USING (
  user_email = auth.jwt() ->> 'email'
  AND (is_sample = false OR is_sample IS NULL)
) WITH CHECK (
  user_email = auth.jwt() ->> 'email'
  AND (is_sample = false OR is_sample IS NULL)
);

CREATE POLICY "Users can delete own quizzes" ON quizzes
FOR DELETE USING (
  user_email = auth.jwt() ->> 'email'
  AND (is_sample = false OR is_sample IS NULL)
);

CREATE POLICY "Users can view accessible quizzes" ON quizzes
FOR SELECT USING (
  user_email = auth.jwt() ->> 'email'
  OR is_sample = true 
  OR is_shared = true
);

-- ===========================
-- 2. shared_quizzes 테이블 정책 업데이트
-- ===========================

DROP POLICY IF EXISTS "Users can create own shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can update own shared quizzes" ON shared_quizzes;
DROP POLICY IF EXISTS "Users can delete own shared quizzes" ON shared_quizzes;

CREATE POLICY "Users can create own shared quizzes" ON shared_quizzes
FOR INSERT WITH CHECK (
  user_email = auth.jwt() ->> 'email'
);

CREATE POLICY "Users can update own shared quizzes" ON shared_quizzes
FOR UPDATE USING (
  user_email = auth.jwt() ->> 'email'
);

CREATE POLICY "Users can delete own shared quizzes" ON shared_quizzes
FOR DELETE USING (
  user_email = auth.jwt() ->> 'email'
);

-- ===========================
-- 3. questions 테이블 정책 업데이트
-- ===========================

DROP POLICY IF EXISTS "Users can insert own questions" ON questions;
DROP POLICY IF EXISTS "Users can update own questions" ON questions;

CREATE POLICY "Users can insert own questions" ON questions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id 
    AND q.user_email = auth.jwt() ->> 'email'
    AND (q.is_sample = false OR q.is_sample IS NULL)
  )
);

CREATE POLICY "Users can update own questions" ON questions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id 
    AND q.user_email = auth.jwt() ->> 'email'
    AND (q.is_sample = false OR q.is_sample IS NULL)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id 
    AND q.user_email = auth.jwt() ->> 'email'
    AND (q.is_sample = false OR q.is_sample IS NULL)
  )
);

-- ===========================
-- 4. question_options 테이블 정책 업데이트
-- ===========================

DROP POLICY IF EXISTS "Users can insert options for their questions" ON question_options;

CREATE POLICY "Users can insert options for their questions" ON question_options
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM questions q
    JOIN quizzes qz ON qz.id = q.quiz_id
    WHERE q.id = question_options.question_id 
    AND qz.user_email = auth.jwt() ->> 'email'
    AND (qz.is_sample = false OR qz.is_sample IS NULL)
  )
);

-- ===========================
-- 5. quiz_ratings 테이블 정책 업데이트
-- ===========================

DROP POLICY IF EXISTS "Users can create own ratings" ON quiz_ratings;

CREATE POLICY "Users can create own ratings" ON quiz_ratings
FOR INSERT WITH CHECK (
  user_email = auth.jwt() ->> 'email'
);

-- ===========================
-- 6. quiz_downloads 테이블 정책 업데이트
-- ===========================

DROP POLICY IF EXISTS "Users can record downloads" ON quiz_downloads;

CREATE POLICY "Users can record downloads" ON quiz_downloads
FOR INSERT WITH CHECK (
  user_email = auth.jwt() ->> 'email'
);

-- ===========================
-- 7. 기타 테이블들은 각 앱 전환 시 처리
-- ===========================
-- Web 앱: contents, claude_usage, daily_stats 등
-- Grading 앱: submissions, feedbacks, rubrics 등

-- ===========================
-- 8. 테스트용 함수
-- ===========================

CREATE OR REPLACE FUNCTION test_auth_jwt()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'jwt_email', auth.jwt() ->> 'email',
    'jwt_sub', auth.jwt() ->> 'sub',
    'jwt_aud', auth.jwt() ->> 'aud',
    'auth_uid', auth.uid(),
    'auth_role', auth.role()
  );
END;
$$;

-- 마이그레이션 완료 메시지
DO $$
BEGIN
  RAISE NOTICE 'RLS 정책이 Supabase Auth JWT 기반으로 마이그레이션되었습니다.';
  RAISE NOTICE '이제 current_setting 대신 auth.jwt() ->> ''email''을 사용합니다.';
END $$;