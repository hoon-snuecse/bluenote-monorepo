-- STEP 3: RLS 정책 업데이트 (타입에 맞게 조정)

-- =====================================================
-- Quiz 앱 RLS 정책 업데이트 (샘플 데이터 허용)
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;

-- 새로운 정책 생성 (user_id가 UUID 타입인 경우)
DO $$
DECLARE
    user_id_type text;
BEGIN
    -- user_id 컬럼의 타입 확인
    SELECT data_type INTO user_id_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'user_id';
    
    IF user_id_type = 'uuid' THEN
        -- user_id가 UUID 타입인 경우
        CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
            FOR SELECT
            TO authenticated
            USING (
                user_id = auth.uid() 
                OR is_sample = true
            );

        CREATE POLICY "Users can create own quizzes" ON public.quizzes
            FOR INSERT
            TO authenticated
            WITH CHECK (
                user_id = auth.uid() 
                AND (is_sample = false OR is_sample IS NULL)
            );

        CREATE POLICY "Users can update own quizzes" ON public.quizzes
            FOR UPDATE
            TO authenticated
            USING (user_id = auth.uid() AND (is_sample = false OR is_sample IS NULL))
            WITH CHECK (user_id = auth.uid() AND (is_sample = false OR is_sample IS NULL));

        CREATE POLICY "Users can delete own quizzes" ON public.quizzes
            FOR DELETE
            TO authenticated
            USING (user_id = auth.uid() AND (is_sample = false OR is_sample IS NULL));
            
    ELSIF user_id_type = 'text' OR user_id_type = 'character varying' THEN
        -- user_id가 TEXT 타입인 경우
        CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
            FOR SELECT
            TO authenticated
            USING (
                user_id = auth.uid()::text 
                OR is_sample = true
            );

        CREATE POLICY "Users can create own quizzes" ON public.quizzes
            FOR INSERT
            TO authenticated
            WITH CHECK (
                user_id = auth.uid()::text 
                AND (is_sample = false OR is_sample IS NULL)
            );

        CREATE POLICY "Users can update own quizzes" ON public.quizzes
            FOR UPDATE
            TO authenticated
            USING (user_id = auth.uid()::text AND (is_sample = false OR is_sample IS NULL))
            WITH CHECK (user_id = auth.uid()::text AND (is_sample = false OR is_sample IS NULL));

        CREATE POLICY "Users can delete own quizzes" ON public.quizzes
            FOR DELETE
            TO authenticated
            USING (user_id = auth.uid()::text AND (is_sample = false OR is_sample IS NULL));
    END IF;
    
    RAISE NOTICE 'RLS policies created for user_id type: %', user_id_type;
END $$;

-- questions 테이블 정책 업데이트
DROP POLICY IF EXISTS "Users can view questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can create questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can update questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can delete questions for their quizzes" ON public.questions;

-- questions 테이블은 quiz_id로 조인하므로 타입 문제 없음
CREATE POLICY "Users can view own and sample questions" ON public.questions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (
                (q.user_id::text = auth.uid()::text) 
                OR q.is_sample = true
            )
        )
    );

CREATE POLICY "Users can manage own questions" ON public.questions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND q.user_id::text = auth.uid()::text
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND q.user_id::text = auth.uid()::text
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    );

-- shared_quizzes 테이블 정책 업데이트
DROP POLICY IF EXISTS "Anyone can view shared quizzes" ON public.shared_quizzes;
DROP POLICY IF EXISTS "Users can share their own quizzes" ON public.shared_quizzes;

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
    RAISE NOTICE 'RLS 정책 업데이트가 완료되었습니다.';
END $$;