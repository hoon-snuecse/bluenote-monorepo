-- Quiz 앱의 실제 존재하는 테이블에 대해서만 RLS 비활성화
-- 테이블 존재 여부를 먼저 확인하고 처리

-- 1. 존재하는 테이블만 RLS 비활성화
DO $$
BEGIN
    -- quizzes 테이블
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quizzes') THEN
        ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- questions 테이블
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questions') THEN
        ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- question_options 테이블
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'question_options') THEN
        ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- shared_quizzes 테이블
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shared_quizzes') THEN
        ALTER TABLE shared_quizzes DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- quiz_downloads 테이블
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_downloads') THEN
        ALTER TABLE quiz_downloads DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- quiz_ratings 테이블
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_ratings') THEN
        ALTER TABLE quiz_ratings DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- quiz_likes 테이블 (존재할 경우에만)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_likes') THEN
        ALTER TABLE quiz_likes DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- quiz_activity_logs 테이블
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_activity_logs') THEN
        ALTER TABLE quiz_activity_logs DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- daily_quiz_stats 테이블
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_quiz_stats') THEN
        ALTER TABLE daily_quiz_stats DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- quiz_exports 테이블 (이전 마이그레이션에서 언급됨)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_exports') THEN
        ALTER TABLE quiz_exports DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- daily_stats 테이블 (이전 마이그레이션에서 언급됨)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_stats') THEN
        ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- user_daily_stats 테이블 (이전 마이그레이션에서 언급됨)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_daily_stats') THEN
        ALTER TABLE user_daily_stats DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. 실제로 존재하는 테이블 확인 (디버깅용)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%quiz%'
ORDER BY tablename;