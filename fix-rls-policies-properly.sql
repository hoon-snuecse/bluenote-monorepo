-- RLS 정책을 정리하고 일관성 있게 수정

-- 1. questions 테이블의 중복된 SELECT 정책 삭제
DROP POLICY IF EXISTS "Users can view own and sample questions" ON questions;
DROP POLICY IF EXISTS "Users can view questions of accessible quizzes" ON questions;

-- 2. 새로운 통합 SELECT 정책 생성
CREATE POLICY "Users can view accessible questions" ON questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    WHERE q.id = questions.quiz_id
    AND (
      q.user_email = current_setting('app.current_user_email', true)
      OR q.is_sample = true
      OR q.is_shared = true
    )
  )
);

-- 3. question_options 테이블의 중복된 SELECT 정책 삭제
DROP POLICY IF EXISTS "Users can view options for accessible questions" ON question_options;
DROP POLICY IF EXISTS "Users can view options of accessible questions" ON question_options;

-- 4. 새로운 통합 SELECT 정책 생성
CREATE POLICY "Users can view accessible question options" ON question_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM questions q
    JOIN quizzes qz ON qz.id = q.quiz_id
    WHERE q.id = question_options.question_id
    AND (
      qz.user_email = current_setting('app.current_user_email', true)
      OR qz.is_sample = true
      OR qz.is_shared = true
    )
  )
);

-- 5. 익명 사용자도 공유된 퀴즈를 볼 수 있도록 정책 수정
-- (current_setting이 null일 때도 작동하도록)
DROP POLICY IF EXISTS "Users can view own, sample, and shared quizzes" ON quizzes;

CREATE POLICY "Users can view accessible quizzes" ON quizzes
FOR SELECT
USING (
  user_email = current_setting('app.current_user_email', true)
  OR is_sample = true
  OR is_shared = true
);

-- 6. shared_quizzes 정책은 그대로 유지 (누구나 볼 수 있음)
-- "Anyone can view shared quizzes" 정책이 이미 true로 설정되어 있음

-- 7. 확인 쿼리
SELECT 'Questions policies after cleanup:' as info;
SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.questions'::regclass;

SELECT 'Question options policies after cleanup:' as info;
SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.question_options'::regclass;

SELECT 'Quizzes policies after cleanup:' as info;
SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.quizzes'::regclass;