-- RLS 정책 업데이트 (user_email 기반)

-- =====================================================
-- Quiz 앱 RLS 정책 업데이트 (샘플 데이터 허용)
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view own and sample quizzes" ON public.quizzes;

-- 새로운 정책 생성 (user_email 기반)
-- 조회: 자신의 퀴즈 + 샘플 퀴즈
CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
    FOR SELECT
    TO authenticated
    USING (
        user_email = auth.jwt() ->> 'email'
        OR is_sample = true
    );

-- 생성: 자신의 퀴즈만 (샘플은 관리자만)
CREATE POLICY "Users can create own quizzes" ON public.quizzes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    );

-- 수정: 자신의 퀴즈만 (샘플 수정 불가)
CREATE POLICY "Users can update own quizzes" ON public.quizzes
    FOR UPDATE
    TO authenticated
    USING (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    )
    WITH CHECK (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    );

-- 삭제: 자신의 퀴즈만 (샘플 삭제 불가)
CREATE POLICY "Users can delete own quizzes" ON public.quizzes
    FOR DELETE
    TO authenticated
    USING (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    );

-- questions 테이블 정책 업데이트
DROP POLICY IF EXISTS "Users can view questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can create questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can update questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can delete questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can view own and sample questions" ON public.questions;
DROP POLICY IF EXISTS "Users can manage own questions" ON public.questions;

-- 조회: 자신의 퀴즈의 문항 + 샘플 퀴즈의 문항
CREATE POLICY "Users can view own and sample questions" ON public.questions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (
                q.user_email = auth.jwt() ->> 'email'
                OR q.is_sample = true
            )
        )
    );

-- 생성/수정/삭제: 자신의 퀴즈의 문항만
CREATE POLICY "Users can manage own questions" ON public.questions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND q.user_email = auth.jwt() ->> 'email'
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND q.user_email = auth.jwt() ->> 'email'
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    );

-- question_options 테이블 정책 업데이트
DROP POLICY IF EXISTS "Users can view options for accessible questions" ON public.question_options;
DROP POLICY IF EXISTS "Users can manage options for their questions" ON public.question_options;

-- 조회: 접근 가능한 문항의 선택지
CREATE POLICY "Users can view options for accessible questions" ON public.question_options
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_options.question_id
            AND (
                qz.user_email = auth.jwt() ->> 'email'
                OR qz.is_sample = true
            )
        )
    );

-- 관리: 자신의 문항의 선택지만
CREATE POLICY "Users can manage options for their questions" ON public.question_options
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_options.question_id
            AND qz.user_email = auth.jwt() ->> 'email'
            AND (qz.is_sample = false OR qz.is_sample IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions q
            JOIN public.quizzes qz ON qz.id = q.quiz_id
            WHERE q.id = question_options.question_id
            AND qz.user_email = auth.jwt() ->> 'email'
            AND (qz.is_sample = false OR qz.is_sample IS NULL)
        )
    );

-- shared_quizzes 테이블 정책 업데이트
DROP POLICY IF EXISTS "Anyone can view shared quizzes" ON public.shared_quizzes;
DROP POLICY IF EXISTS "Users can share their own quizzes" ON public.shared_quizzes;
DROP POLICY IF EXISTS "Users can share own quizzes" ON public.shared_quizzes;

-- 조회: 모든 공유된 퀴즈 (샘플 포함)
CREATE POLICY "Anyone can view shared quizzes" ON public.shared_quizzes
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 공유: 자신의 퀴즈만 (샘플은 공유 불가)
CREATE POLICY "Users can share own quizzes" ON public.shared_quizzes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_email = auth.jwt() ->> 'email'
        AND (is_sample = false OR is_sample IS NULL)
    );

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'RLS 정책 업데이트가 완료되었습니다 (user_email 기반).';
END $$;