-- shared_quizzes와 quizzes 간 외래 키 관계 추가
ALTER TABLE shared_quizzes 
ADD CONSTRAINT fk_shared_quizzes_quiz_id 
FOREIGN KEY (quiz_id) 
REFERENCES quizzes(id) 
ON DELETE CASCADE;

-- shared_quizzes에서 quizzes를 join할 때를 위한 RLS 정책 수정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view shared quizzes" ON shared_quizzes;

-- 새로운 정책 추가 (공유된 퀴즈만 볼 수 있도록)
CREATE POLICY "Anyone can view shared quizzes with shared quiz check" ON shared_quizzes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = shared_quizzes.quiz_id 
    AND quizzes.is_shared = true
  )
);

-- questions 테이블의 RLS 정책도 수정 (공유된 퀴즈의 문항은 누구나 볼 수 있도록)
DROP POLICY IF EXISTS "Users can view own, sample, and shared questions" ON questions;

CREATE POLICY "Users can view own, sample, and shared questions" ON questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = questions.quiz_id 
    AND (
      quizzes.user_email = current_setting('app.current_user_email', true)
      OR quizzes.is_sample = true
      OR quizzes.is_shared = true
    )
  )
);

-- question_options도 동일하게 수정
DROP POLICY IF EXISTS "Users can view options for accessible questions" ON question_options;

CREATE POLICY "Users can view options for accessible questions" ON question_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM questions q
    JOIN quizzes qz ON q.quiz_id = qz.id
    WHERE q.id = question_options.question_id
    AND (
      qz.user_email = current_setting('app.current_user_email', true)
      OR qz.is_sample = true
      OR qz.is_shared = true
    )
  )
);

-- 확인 쿼리
SELECT 'shared_quizzes policies:' as info;
SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.shared_quizzes'::regclass;

SELECT 'questions policies:' as info;
SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.questions'::regclass;

SELECT 'question_options policies:' as info;
SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.question_options'::regclass;