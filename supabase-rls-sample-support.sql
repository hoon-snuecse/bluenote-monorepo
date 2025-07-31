-- RLS 샘플 데이터 지원을 위한 데이터베이스 스키마 업데이트
-- 사용자가 자신의 데이터와 샘플 데이터를 모두 볼 수 있도록 개선

-- =====================================================
-- 1. Quiz 앱 테이블 스키마 업데이트
-- =====================================================

-- quizzes 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sample_order INTEGER DEFAULT NULL;

-- questions 테이블에도 샘플 표시 추가 (퀴즈와 연동)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;

-- shared_quizzes 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public.shared_quizzes 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sample_order INTEGER DEFAULT NULL;

-- =====================================================
-- 2. Grading 앱 테이블 스키마 업데이트
-- =====================================================

-- Assignment 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public."Assignment" 
ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "sampleOrder" INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "sampleCategory" VARCHAR(50) DEFAULT NULL;

-- EvaluationTemplate 테이블에 샘플 표시 컬럼 추가
ALTER TABLE public."EvaluationTemplate" 
ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "sampleOrder" INTEGER DEFAULT NULL;

-- Submission 테이블에도 샘플 표시 추가 (과제와 연동)
ALTER TABLE public."Submission" 
ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false;

-- =====================================================
-- 3. Quiz 앱 RLS 정책 업데이트 (샘플 데이터 허용)
-- =====================================================

-- quizzes 테이블 정책 교체
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;

-- 조회: 자신의 퀴즈 + 샘플 퀴즈
CREATE POLICY "Users can view own and sample quizzes" ON public.quizzes
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()::text 
        OR is_sample = true
    );

-- 생성: 자신의 퀴즈만 (샘플 제외)
CREATE POLICY "Users can create own quizzes" ON public.quizzes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()::text 
        AND (is_sample IS NULL OR is_sample = false)
    );

-- 수정: 자신의 퀴즈만 (샘플 제외)
CREATE POLICY "Users can update own quizzes" ON public.quizzes
    FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid()::text 
        AND is_sample = false
    )
    WITH CHECK (
        user_id = auth.uid()::text 
        AND is_sample = false
    );

-- 삭제: 자신의 퀴즈만 (샘플 제외)
CREATE POLICY "Users can delete own quizzes" ON public.quizzes
    FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()::text 
        AND is_sample = false
    );

-- questions 테이블 정책 교체
DROP POLICY IF EXISTS "Users can access questions of own quizzes" ON public.questions;

CREATE POLICY "Users can access questions of own and sample quizzes" ON public.questions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q 
            WHERE q.id = questions.quiz_id 
            AND (q.user_id = auth.uid()::text OR q.is_sample = true)
        )
    );

-- shared_quizzes 테이블 정책 교체
DROP POLICY IF EXISTS "Users can view public shared quizzes" ON public.shared_quizzes;

CREATE POLICY "Users can view public and sample shared quizzes" ON public.shared_quizzes
    FOR SELECT
    TO authenticated
    USING (
        is_public = true 
        OR user_id = auth.uid()::text 
        OR is_sample = true
    );

-- =====================================================
-- 4. Grading 앱 RLS 정책 업데이트 (샘플 데이터 허용)
-- =====================================================

-- Assignment 테이블 정책 교체
DROP POLICY IF EXISTS "Users can manage own assignments" ON public."Assignment";

-- 조회: 자신의 과제 + 샘플 과제
CREATE POLICY "Users can view own and sample assignments" ON public."Assignment"
    FOR SELECT
    TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        OR "isSample" = true
    );

-- 생성: 자신의 과제만
CREATE POLICY "Users can create own assignments" ON public."Assignment"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        email = auth.jwt() ->> 'email'
        AND ("isSample" IS NULL OR "isSample" = false)
    );

-- 수정: 자신의 과제만 (샘플 제외)
CREATE POLICY "Users can update own assignments" ON public."Assignment"
    FOR UPDATE
    TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        AND "isSample" = false
    )
    WITH CHECK (
        email = auth.jwt() ->> 'email' 
        AND "isSample" = false
    );

-- 삭제: 자신의 과제만 (샘플 제외)
CREATE POLICY "Users can delete own assignments" ON public."Assignment"
    FOR DELETE
    TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        AND "isSample" = false
    );

-- Submission 테이블 정책 업데이트
DROP POLICY IF EXISTS "Assignment owners can view submissions" ON public."Submission";

-- 과제 소유자는 모든 제출물 조회 가능 (샘플 과제의 제출물 포함)
CREATE POLICY "Assignment owners can view submissions" ON public."Submission"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public."Assignment" a 
            WHERE a.id = "Submission"."assignmentId" 
            AND (a.email = auth.jwt() ->> 'email' OR a."isSample" = true)
        )
    );

-- EvaluationTemplate 테이블 정책 교체
DROP POLICY IF EXISTS "Users can manage own templates" ON public."EvaluationTemplate";

-- 조회: 자신의 템플릿 + 샘플 템플릿
CREATE POLICY "Users can view own and sample templates" ON public."EvaluationTemplate"
    FOR SELECT
    TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        OR "isSample" = true
    );

-- 생성: 자신의 템플릿만
CREATE POLICY "Users can create own templates" ON public."EvaluationTemplate"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        email = auth.jwt() ->> 'email'
        AND ("isSample" IS NULL OR "isSample" = false)
    );

-- 수정: 자신의 템플릿만 (샘플 제외)
CREATE POLICY "Users can update own templates" ON public."EvaluationTemplate"
    FOR UPDATE
    TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        AND "isSample" = false
    )
    WITH CHECK (
        email = auth.jwt() ->> 'email' 
        AND "isSample" = false
    );

-- 삭제: 자신의 템플릿만 (샘플 제외)
CREATE POLICY "Users can delete own templates" ON public."EvaluationTemplate"
    FOR DELETE
    TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        AND "isSample" = false
    );

-- =====================================================
-- 5. 인덱스 추가 (성능 최적화)
-- =====================================================

-- Quiz 앱 인덱스
CREATE INDEX IF NOT EXISTS idx_quizzes_is_sample ON public.quizzes(is_sample) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_quizzes_user_sample ON public.quizzes(user_id, is_sample);
CREATE INDEX IF NOT EXISTS idx_shared_quizzes_is_sample ON public.shared_quizzes(is_sample) WHERE is_sample = true;

-- Grading 앱 인덱스
CREATE INDEX IF NOT EXISTS idx_assignment_is_sample ON public."Assignment"("isSample") WHERE "isSample" = true;
CREATE INDEX IF NOT EXISTS idx_assignment_email_sample ON public."Assignment"(email, "isSample");
CREATE INDEX IF NOT EXISTS idx_eval_template_is_sample ON public."EvaluationTemplate"("isSample") WHERE "isSample" = true;

-- =====================================================
-- 실행 방법:
-- 1. Supabase 대시보드의 SQL Editor에서 이 스크립트를 실행하세요
-- 2. 실행 후 다음 단계로 샘플 데이터를 삽입하세요
-- =====================================================