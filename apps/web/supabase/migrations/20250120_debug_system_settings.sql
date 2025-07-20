-- 1. 먼저 테이블 내용 확인 (Service Role로 실행)
SELECT * FROM system_settings;

-- 2. 테이블이 비어있다면 기본 행 삽입
INSERT INTO system_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- 3. 다시 확인
SELECT * FROM system_settings;

-- 4. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'system_settings';

-- 5. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'system_settings'
ORDER BY ordinal_position;