-- RLS 샘플 데이터 지원을 위한 데이터베이스 스키마 업데이트
-- 사용자가 자신의 데이터와 샘플 데이터를 모두 볼 수 있도록 개선

-- =====================================================
-- 1. Quiz 앱 테이블 스키마 업데이트
-- =====================================================

-- quizzes 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sample_order INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sample_category VARCHAR(50) DEFAULT NULL;

-- questions 테이블에도 샘플 표시 추가 (퀴즈와 연동)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;

-- shared_quizzes 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public.shared_quizzes 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sample_order INTEGER DEFAULT NULL;

-- =====================================================
-- 2. Grading 앱 테이블 스키마 업데이트 (존재하는 경우만)
-- =====================================================

DO $$
BEGIN
    -- Assignment 테이블 체크 및 업데이트
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Assignment') THEN
        ALTER TABLE public."Assignment" 
        ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "sampleOrder" INTEGER DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS "sampleCategory" VARCHAR(50) DEFAULT NULL;
    END IF;

    -- EvaluationTemplate 테이블 체크 및 업데이트
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'EvaluationTemplate') THEN
        ALTER TABLE public."EvaluationTemplate" 
        ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "sampleOrder" INTEGER DEFAULT NULL;
    END IF;

    -- Submission 테이블 체크 및 업데이트
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Submission') THEN
        ALTER TABLE public."Submission" 
        ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- =====================================================
-- 3. Quiz 앱 RLS 정책 업데이트 (샘플 데이터 허용)
-- =====================================================

-- quizzes 테이블 정책 교체
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;

-- 조회: 자신의 퀴즈 + 샘플 퀴즈 (타입 캐스팅 추가)
CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()::text 
        OR is_sample = true
    );

-- 생성: 자신의 퀴즈만 (샘플은 관리자만)
CREATE POLICY "Users can create own quizzes" ON public.quizzes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()::text 
        AND (is_sample = false OR is_sample IS NULL)
    );

-- 수정: 자신의 퀴즈만 (샘플 수정 불가)
CREATE POLICY "Users can update own quizzes" ON public.quizzes
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid()::text AND (is_sample = false OR is_sample IS NULL))
    WITH CHECK (user_id = auth.uid()::text AND (is_sample = false OR is_sample IS NULL));

-- 삭제: 자신의 퀴즈만 (샘플 삭제 불가)
CREATE POLICY "Users can delete own quizzes" ON public.quizzes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid()::text AND (is_sample = false OR is_sample IS NULL));

-- questions 테이블 정책 업데이트
DROP POLICY IF EXISTS "Users can view questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can create questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can update questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Users can delete questions for their quizzes" ON public.questions;

-- 조회: 자신의 퀴즈의 문항 + 샘플 퀴즈의 문항
CREATE POLICY "Users can view own and sample questions" ON public.questions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (q.user_id = auth.uid()::text OR q.is_sample = true)
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
            AND q.user_id = auth.uid()::text
            AND (q.is_sample = false OR q.is_sample IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND q.user_id = auth.uid()::text
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
-- 4. 인덱스 추가 (성능 최적화)
-- =====================================================

-- 샘플 데이터 조회 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_quizzes_is_sample ON public.quizzes(is_sample);
CREATE INDEX IF NOT EXISTS idx_quizzes_sample_order ON public.quizzes(sample_order) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_shared_quizzes_is_sample ON public.shared_quizzes(is_sample);

DO $$
BEGIN
    -- Grading 앱 인덱스 (테이블이 존재하는 경우만)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Assignment') THEN
        CREATE INDEX IF NOT EXISTS "idx_Assignment_isSample" ON public."Assignment"("isSample");
        CREATE INDEX IF NOT EXISTS "idx_Assignment_sampleOrder" ON public."Assignment"("sampleOrder") WHERE "isSample" = true;
    END IF;
END $$;

-- =====================================================
-- 5. 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '샘플 데이터 지원을 위한 스키마 업데이트가 완료되었습니다.';
END $$;