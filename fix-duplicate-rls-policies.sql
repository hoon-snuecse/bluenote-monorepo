-- 중복된 RLS 정책 제거 (기존 정책 삭제하고 새 정책만 유지)

-- questions 테이블의 중복 정책 제거
DROP POLICY IF EXISTS "Users can view own and sample questions" ON public.questions;

-- question_options 테이블의 중복 정책 제거  
DROP POLICY IF EXISTS "Users can view options for accessible questions" ON public.question_options;

-- 정책이 제대로 적용되었는지 확인
SELECT 'Questions policies:' as info;
SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.questions'::regclass;

SELECT 'Question options policies:' as info;
SELECT polname, polcmd FROM pg_policy WHERE polrelid = 'public.question_options'::regclass;