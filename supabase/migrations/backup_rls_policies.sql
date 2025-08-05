-- RLS 정책 백업 (2025-08-05)
-- 이 파일은 JWT 기반으로 전환하기 전의 원본 RLS 정책들입니다.
-- 롤백이 필요한 경우 이 SQL을 실행하세요.

-- quizzes 테이블
DROP POLICY IF EXISTS "Users can create own quizzes" ON quizzes;
CREATE POLICY "Users can create own quizzes" ON quizzes
FOR INSERT WITH CHECK (
  (user_email)::text = current_setting('app.current_user_email'::text, true) 
  AND (is_sample = false OR is_sample IS NULL)
);

DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
CREATE POLICY "Users can update own quizzes" ON quizzes
FOR UPDATE USING (
  (user_email)::text = current_setting('app.current_user_email'::text, true) 
  AND (is_sample = false OR is_sample IS NULL)
) WITH CHECK (
  (user_email)::text = current_setting('app.current_user_email'::text, true) 
  AND (is_sample = false OR is_sample IS NULL)
);

DROP POLICY IF EXISTS "Users can delete own quizzes" ON quizzes;
CREATE POLICY "Users can delete own quizzes" ON quizzes
FOR DELETE USING (
  (user_email)::text = current_setting('app.current_user_email'::text, true) 
  AND (is_sample = false OR is_sample IS NULL)
);

DROP POLICY IF EXISTS "Users can view accessible quizzes" ON quizzes;
CREATE POLICY "Users can view accessible quizzes" ON quizzes
FOR SELECT USING (
  (user_email)::text = current_setting('app.current_user_email'::text, true) 
  OR is_sample = true 
  OR is_shared = true
);

-- shared_quizzes 테이블
DROP POLICY IF EXISTS "Users can create own shared quizzes" ON shared_quizzes;
CREATE POLICY "Users can create own shared quizzes" ON shared_quizzes
FOR INSERT WITH CHECK (
  (user_email)::text = current_setting('app.current_user_email'::text, true)
);

DROP POLICY IF EXISTS "Users can update own shared quizzes" ON shared_quizzes;
CREATE POLICY "Users can update own shared quizzes" ON shared_quizzes
FOR UPDATE USING (
  (user_email)::text = current_setting('app.current_user_email'::text, true)
);

DROP POLICY IF EXISTS "Users can delete own shared quizzes" ON shared_quizzes;
CREATE POLICY "Users can delete own shared quizzes" ON shared_quizzes
FOR DELETE USING (
  (user_email)::text = current_setting('app.current_user_email'::text, true)
);

-- questions 테이블
DROP POLICY IF EXISTS "Users can insert own questions" ON questions;
CREATE POLICY "Users can insert own questions" ON questions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id 
    AND (q.user_email)::text = current_setting('app.current_user_email'::text, true) 
    AND (q.is_sample = false OR q.is_sample IS NULL)
  )
);

DROP POLICY IF EXISTS "Users can update own questions" ON questions;
CREATE POLICY "Users can update own questions" ON questions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id 
    AND (q.user_email)::text = current_setting('app.current_user_email'::text, true) 
    AND (q.is_sample = false OR q.is_sample IS NULL)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM quizzes q 
    WHERE q.id = questions.quiz_id 
    AND (q.user_email)::text = current_setting('app.current_user_email'::text, true) 
    AND (q.is_sample = false OR q.is_sample IS NULL)
  )
);

-- question_options 테이블
DROP POLICY IF EXISTS "Users can insert options for their questions" ON question_options;
CREATE POLICY "Users can insert options for their questions" ON question_options
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM questions q
    JOIN quizzes qz ON qz.id = q.quiz_id
    WHERE q.id = question_options.question_id 
    AND (qz.user_email)::text = current_setting('app.current_user_email'::text, true) 
    AND (qz.is_sample = false OR qz.is_sample IS NULL)
  )
);

-- quiz_ratings 테이블
DROP POLICY IF EXISTS "Users can create own ratings" ON quiz_ratings;
CREATE POLICY "Users can create own ratings" ON quiz_ratings
FOR INSERT WITH CHECK (
  (user_email)::text = current_setting('app.current_user_email'::text, true)
);

-- quiz_downloads 테이블
DROP POLICY IF EXISTS "Users can record downloads" ON quiz_downloads;
CREATE POLICY "Users can record downloads" ON quiz_downloads
FOR INSERT WITH CHECK (
  (user_email)::text = current_setting('app.current_user_email'::text, true)
);