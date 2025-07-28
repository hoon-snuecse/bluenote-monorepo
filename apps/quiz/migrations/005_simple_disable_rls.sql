-- 가장 중요한 테이블들만 RLS 비활성화 (즉시 실행 가능)
-- 에러가 발생하면 해당 줄을 건너뛰고 다음 줄 실행

ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_quizzes DISABLE ROW LEVEL SECURITY;