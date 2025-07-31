-- quizzes 테이블에 is_shared 필드 추가
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;

-- 기존 공유된 퀴즈들의 is_shared 필드 업데이트
UPDATE public.quizzes q
SET is_shared = true
WHERE EXISTS (
  SELECT 1 
  FROM public.shared_quizzes sq 
  WHERE sq.quiz_id = q.id 
  AND sq.is_public = true
);

-- RLS 정책 업데이트: 자신의 퀴즈, 샘플 퀴즈, 공유된 퀴즈 모두 볼 수 있도록
DROP POLICY IF EXISTS "Users can view own and sample quizzes" ON public.quizzes;

CREATE POLICY "Users can view own, sample, and shared quizzes" 
ON public.quizzes
FOR SELECT
TO authenticated
USING (
  (user_email::text = current_setting('app.current_user_email'::text, true))
  OR (is_sample = true)
  OR (is_shared = true)
);

-- questions 테이블의 RLS 정책도 업데이트
DROP POLICY IF EXISTS "Users can view own questions" ON public.questions;

CREATE POLICY "Users can view questions of accessible quizzes" 
ON public.questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.quizzes q 
    WHERE q.id = questions.quiz_id
    AND (
      q.user_email::text = current_setting('app.current_user_email'::text, true)
      OR q.is_sample = true
      OR q.is_shared = true
    )
  )
);

-- question_options 테이블의 RLS 정책도 업데이트
DROP POLICY IF EXISTS "Users can view own question options" ON public.question_options;

CREATE POLICY "Users can view options of accessible questions" 
ON public.question_options
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.questions q
    JOIN public.quizzes qz ON qz.id = q.quiz_id
    WHERE q.id = question_options.question_id
    AND (
      qz.user_email::text = current_setting('app.current_user_email'::text, true)
      OR qz.is_sample = true
      OR qz.is_shared = true
    )
  )
);

-- 트리거 생성: shared_quizzes에 추가될 때 자동으로 is_shared를 true로 설정
CREATE OR REPLACE FUNCTION update_quiz_is_shared()
RETURNS TRIGGER AS $$
BEGIN
  -- 공유 추가 시
  IF TG_OP = 'INSERT' AND NEW.is_public = true THEN
    UPDATE public.quizzes 
    SET is_shared = true 
    WHERE id = NEW.quiz_id;
  END IF;
  
  -- 공유 삭제 시
  IF TG_OP = 'DELETE' THEN
    UPDATE public.quizzes 
    SET is_shared = false 
    WHERE id = OLD.quiz_id
    AND NOT EXISTS (
      SELECT 1 FROM public.shared_quizzes 
      WHERE quiz_id = OLD.quiz_id 
      AND is_public = true
      AND id != OLD.id
    );
  END IF;
  
  -- 공유 상태 변경 시
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_public = true AND (OLD.is_public = false OR OLD.is_public IS NULL) THEN
      UPDATE public.quizzes 
      SET is_shared = true 
      WHERE id = NEW.quiz_id;
    ELSIF NEW.is_public = false AND OLD.is_public = true THEN
      UPDATE public.quizzes 
      SET is_shared = false 
      WHERE id = NEW.quiz_id
      AND NOT EXISTS (
        SELECT 1 FROM public.shared_quizzes 
        WHERE quiz_id = NEW.quiz_id 
        AND is_public = true
        AND id != NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
DROP TRIGGER IF EXISTS update_quiz_is_shared_trigger ON public.shared_quizzes;
CREATE TRIGGER update_quiz_is_shared_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.shared_quizzes
FOR EACH ROW
EXECUTE FUNCTION update_quiz_is_shared();