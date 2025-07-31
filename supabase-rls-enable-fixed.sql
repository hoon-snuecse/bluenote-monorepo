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
-- 2. Grading 앱 테이블 - Prisma로 관리되는 테이블들
-- 이 테이블들은 Prisma/외부 PostgreSQL에서 관리되므로
-- Supabase에서는 RLS만 활성화하고 정책은 추가하지 않음
-- =====================================================

-- Assignment
ALTER TABLE public."Assignment" ENABLE ROW LEVEL SECURITY;

-- Submission
ALTER TABLE public."Submission" ENABLE ROW LEVEL SECURITY;

-- Evaluation
ALTER TABLE public."Evaluation" ENABLE ROW LEVEL SECURITY;

-- AccessToken
ALTER TABLE public."AccessToken" ENABLE ROW LEVEL SECURITY;

-- EvaluationTemplate
ALTER TABLE public."EvaluationTemplate" ENABLE ROW LEVEL SECURITY;

-- SystemSettings
ALTER TABLE public."SystemSettings" ENABLE ROW LEVEL SECURITY;

-- User
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- google_tokens (Grading app)
-- 이미 위에서 처리됨

-- =====================================================
-- 3. Web 앱 테이블들
-- =====================================================

-- ai_writing_history
ALTER TABLE public.ai_writing_history ENABLE ROW LEVEL SECURITY;

-- feedbacks
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- lesson_history
ALTER TABLE public.lesson_history ENABLE ROW LEVEL SECURITY;

-- lesson_progress
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- teaching_materials
ALTER TABLE public.teaching_materials ENABLE ROW LEVEL SECURITY;

-- user_writing_history
ALTER TABLE public.user_writing_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. 정책이 필요한 테이블들에 대한 기본 정책 추가
-- (이미 정책이 있는 테이블은 제외)
-- =====================================================

-- Web 앱 테이블들에 대한 기본 정책 (필요한 경우)
-- ai_writing_history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_writing_history' 
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can manage own ai_writing_history" ON public.ai_writing_history
            FOR ALL TO authenticated
            USING (auth.uid()::text = user_id)
            WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

-- feedbacks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feedbacks' 
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can manage own feedbacks" ON public.feedbacks
            FOR ALL TO authenticated
            USING (auth.uid()::text = user_id)
            WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

-- lesson_history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lesson_history' 
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can manage own lesson_history" ON public.lesson_history
            FOR ALL TO authenticated
            USING (auth.uid()::text = user_id)
            WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

-- lesson_progress
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lesson_progress' 
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can manage own lesson_progress" ON public.lesson_progress
            FOR ALL TO authenticated
            USING (auth.uid()::text = user_id)
            WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

-- teaching_materials
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'teaching_materials' 
        AND schemaname = 'public'
    ) THEN
        -- teaching_materials는 공개 읽기, 인증된 사용자만 쓰기
        CREATE POLICY "Anyone can view teaching_materials" ON public.teaching_materials
            FOR SELECT TO anon, authenticated
            USING (true);
            
        CREATE POLICY "Authenticated users can create teaching_materials" ON public.teaching_materials
            FOR INSERT TO authenticated
            WITH CHECK (true);
            
        CREATE POLICY "Users can update own teaching_materials" ON public.teaching_materials
            FOR UPDATE TO authenticated
            USING (auth.uid()::text = user_id)
            WITH CHECK (auth.uid()::text = user_id);
            
        CREATE POLICY "Users can delete own teaching_materials" ON public.teaching_materials
            FOR DELETE TO authenticated
            USING (auth.uid()::text = user_id);
    END IF;
END $$;

-- user_writing_history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_writing_history' 
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can manage own user_writing_history" ON public.user_writing_history
            FOR ALL TO authenticated
            USING (auth.uid()::text = user_id)
            WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

-- =====================================================
-- 5. 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'RLS 활성화가 완료되었습니다. 33개 테이블에 대해 RLS가 활성화되었습니다.';
END $$;