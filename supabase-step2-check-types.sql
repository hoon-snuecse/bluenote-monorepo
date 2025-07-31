-- STEP 2: 데이터 타입 확인 및 RLS 정책 업데이트

-- 먼저 user_id 컬럼의 타입을 확인
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes' 
AND column_name = 'user_id';

-- auth.uid()의 타입 확인
SELECT auth.uid() AS uid, pg_typeof(auth.uid()) AS uid_type;