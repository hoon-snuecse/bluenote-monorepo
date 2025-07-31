-- quizzes 테이블의 모든 컬럼 확인
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
ORDER BY ordinal_position;

-- 실제 데이터 샘플 확인 (user 관련 컬럼 찾기)
SELECT * FROM public.quizzes LIMIT 1;