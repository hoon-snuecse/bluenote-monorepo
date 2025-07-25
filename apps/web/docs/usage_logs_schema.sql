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

-- 2. 테이블이 없다면 생성
-- CREATE TABLE IF NOT EXISTS usage_logs (
--     id SERIAL PRIMARY KEY,
--     user_email VARCHAR(255) NOT NULL,
--     action_type VARCHAR(50) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- 3. metadata 컬럼이 있다면 제거 (선택사항)
-- ALTER TABLE usage_logs DROP COLUMN IF EXISTS metadata;

-- 4. 인덱스 추가 (성능 개선)
-- CREATE INDEX IF NOT EXISTS idx_usage_logs_user_email ON usage_logs(user_email);
-- CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON usage_logs(action_type);
-- CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);