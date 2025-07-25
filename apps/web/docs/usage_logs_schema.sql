-- usage_logs 테이블 스키마 확인
-- 이 쿼리를 Supabase SQL Editor에서 실행하여 현재 스키마를 확인하세요

-- 1. 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'usage_logs'
ORDER BY 
    ordinal_position;

-- 2. CHECK 제약 조건 확인
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'usage_logs'::regclass
    AND contype = 'c';

-- 3. CHECK 제약 조건 수정 (로그인 추가)
-- ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_action_type_check;
-- ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_action_type_check 
--     CHECK (action_type IN ('claude_chat', 'post_write', 'login'));

-- 4. 테이블이 없다면 생성
-- CREATE TABLE IF NOT EXISTS usage_logs (
--     id SERIAL PRIMARY KEY,
--     user_email VARCHAR(255) NOT NULL,
--     action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('claude_chat', 'post_write', 'login')),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- 3. metadata 컬럼이 있다면 제거 (선택사항)
-- ALTER TABLE usage_logs DROP COLUMN IF EXISTS metadata;

-- 4. 인덱스 추가 (성능 개선)
-- CREATE INDEX IF NOT EXISTS idx_usage_logs_user_email ON usage_logs(user_email);
-- CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON usage_logs(action_type);
-- CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);