-- Supabase Security Advisor 오류 수정 스크립트
-- 실제 존재하는 테이블에 대해서만 RLS 활성화

-- =====================================================
-- 존재하는 테이블에 대해서만 RLS 활성화
-- =====================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Quiz 앱 관련 테이블들
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'daily_stats',
            'google_tokens',
            'question_options',
            'questions',
            'quiz_downloads',
            'quiz_exports',
            'quiz_ratings',
            'quizzes',
            'shared_quizzes',
            'user_daily_stats',
            'ai_writing_history',
            'feedbacks',
            'lesson_history',
            'lesson_progress',
            'teaching_materials',
            'user_writing_history'
        )
    ) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
        RAISE NOTICE 'RLS enabled for table: %', r.tablename;
    END LOOP;

    -- Grading 앱 관련 테이블들 (대소문자 구분)
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'Assignment',
            'Submission',
            'Evaluation',
            'AccessToken',
            'EvaluationTemplate',
            'SystemSettings',
            'User'
        )
    ) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
        RAISE NOTICE 'RLS enabled for table: %', r.tablename;
    END LOOP;

    RAISE NOTICE 'RLS 활성화 완료. 존재하는 테이블에 대해서만 RLS가 활성화되었습니다.';
END $$;