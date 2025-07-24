-- 모든 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- created_by 또는 teacher_id 같은 컬럼이 있는 테이블 찾기
SELECT 
    t.table_name,
    c.column_name,
    c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND c.column_name IN ('created_by', 'teacher_id', 'user_id', 'user_email', 'createdBy', 'teacherId')
ORDER BY t.table_name, c.column_name;
