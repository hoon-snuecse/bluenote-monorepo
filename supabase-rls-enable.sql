-- Supabase Security Advisor 오류 수정 스크립트
-- 33개의 RLS 비활성화 오류를 해결합니다

-- =====================================================
-- 1. Quiz 앱 테이블 - RLS 정책은 있지만 RLS가 비활성화된 경우
-- =====================================================

-- daily_stats
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- google_tokens  
ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

-- question_options
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

-- questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- quiz_downloads
ALTER TABLE public.quiz_downloads ENABLE ROW LEVEL SECURITY;

-- quiz_exports
ALTER TABLE public.quiz_exports ENABLE ROW LEVEL SECURITY;

-- quiz_ratings
ALTER TABLE public.quiz_ratings ENABLE ROW LEVEL SECURITY;

-- quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- shared_quizzes
ALTER TABLE public.shared_quizzes ENABLE ROW LEVEL SECURITY;

-- user_daily_stats
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Grading 앱 테이블 - RLS가 전혀 활성화되지 않은 경우
-- =====================================================

-- Assignment
ALTER TABLE public."Assignment" ENABLE ROW LEVEL SECURITY;

-- 기본 정책 추가 (교사만 자신의 과제 관리)
CREATE POLICY "Users can manage own assignments" ON public."Assignment"
    FOR ALL 
    TO authenticated
    USING (email = auth.jwt() ->> 'email')
    WITH CHECK (email = auth.jwt() ->> 'email');

-- Submission
ALTER TABLE public."Submission" ENABLE ROW LEVEL SECURITY;

-- 제출물은 해당 과제의 소유자나 제출자가 볼 수 있음
CREATE POLICY "Assignment owners can view submissions" ON public."Submission"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public."Assignment" a 
            WHERE a.id = "Submission"."assignmentId" 
            AND a.email = auth.jwt() ->> 'email'
        )
    );

-- 누구나 제출할 수 있음 (학생용)
CREATE POLICY "Anyone can create submissions" ON public."Submission"
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Evaluation
ALTER TABLE public."Evaluation" ENABLE ROW LEVEL SECURITY;

-- 평가는 해당 과제의 소유자만 관리
CREATE POLICY "Assignment owners can manage evaluations" ON public."Evaluation"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public."Assignment" a
            JOIN public."Submission" s ON s."assignmentId" = a.id
            WHERE s.id = "Evaluation"."submissionId"
            AND a.email = auth.jwt() ->> 'email'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public."Assignment" a
            JOIN public."Submission" s ON s."assignmentId" = a.id
            WHERE s.id = "Evaluation"."submissionId"
            AND a.email = auth.jwt() ->> 'email'
        )
    );

-- EvaluationTemplate
ALTER TABLE public."EvaluationTemplate" ENABLE ROW LEVEL SECURITY;

-- 템플릿은 소유자만 관리
CREATE POLICY "Users can manage own templates" ON public."EvaluationTemplate"
    FOR ALL
    TO authenticated
    USING (email = auth.jwt() ->> 'email')
    WITH CHECK (email = auth.jwt() ->> 'email');

-- User (Grading 앱용)
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 정보만 관리
CREATE POLICY "Users can manage own profile" ON public."User"
    FOR ALL
    TO authenticated
    USING (email = auth.jwt() ->> 'email')
    WITH CHECK (email = auth.jwt() ->> 'email');

-- AccessToken
ALTER TABLE public."AccessToken" ENABLE ROW LEVEL SECURITY;

-- 토큰은 소유자만 관리
CREATE POLICY "Users can manage own tokens" ON public."AccessToken"
    FOR ALL
    TO authenticated
    USING ("userId" = auth.uid()::text)
    WITH CHECK ("userId" = auth.uid()::text);

-- SystemSettings (두 개의 테이블이 있음)
ALTER TABLE public."SystemSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 시스템 설정은 인증된 사용자만 읽기 가능
CREATE POLICY "Authenticated users can read system settings" ON public."SystemSettings"
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read system settings" ON public.system_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- 3. Web 앱 테이블 - RLS가 전혀 활성화되지 않은 경우
-- =====================================================

-- research_posts
ALTER TABLE public.research_posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 게시물 읽기 가능
CREATE POLICY "Anyone can read research posts" ON public.research_posts
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 관리자만 게시물 작성/수정/삭제
CREATE POLICY "Admins can manage research posts" ON public.research_posts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- research_post_images
ALTER TABLE public.research_post_images ENABLE ROW LEVEL SECURITY;

-- 이미지는 게시물과 동일한 정책
CREATE POLICY "Anyone can read research post images" ON public.research_post_images
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage research post images" ON public.research_post_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- teaching_posts
ALTER TABLE public.teaching_posts ENABLE ROW LEVEL SECURITY;

-- 게시물 읽기는 모두 가능
CREATE POLICY "Anyone can read teaching posts" ON public.teaching_posts
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 관리자만 관리
CREATE POLICY "Admins can manage teaching posts" ON public.teaching_posts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- teaching_post_images
ALTER TABLE public.teaching_post_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read teaching post images" ON public.teaching_post_images
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage teaching post images" ON public.teaching_post_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- analytics_posts
ALTER TABLE public.analytics_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read analytics posts" ON public.analytics_posts
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage analytics posts" ON public.analytics_posts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- analytics_post_images
ALTER TABLE public.analytics_post_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read analytics post images" ON public.analytics_post_images
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage analytics post images" ON public.analytics_post_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- shed_posts
ALTER TABLE public.shed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shed posts" ON public.shed_posts
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage shed posts" ON public.shed_posts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- shed_post_images
ALTER TABLE public.shed_post_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shed post images" ON public.shed_post_images
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage shed post images" ON public.shed_post_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- research_files
ALTER TABLE public.research_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read research files" ON public.research_files
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage research files" ON public.research_files
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
        )
    );

-- =====================================================
-- 실행 방법:
-- 1. Supabase 대시보드의 SQL Editor에서 이 스크립트를 실행하세요
-- 2. 실행 후 Security Advisor를 다시 확인하여 오류가 해결되었는지 확인하세요
-- =====================================================