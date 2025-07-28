-- 모든 Quiz 관련 테이블의 RLS 상태 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND (
    tablename LIKE '%quiz%' OR 
    tablename LIKE '%question%' OR
    tablename IN ('daily_stats', 'user_daily_stats')
)
ORDER BY tablename;

-- questions와 question_options 테이블이 있다면 RLS 비활성화
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;