-- usage_logs 테이블에 'login' action_type 추가하기
-- Supabase SQL Editor에서 이 쿼리들을 순서대로 실행하세요

-- 1. 현재 CHECK 제약 조건 확인
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'usage_logs'::regclass
    AND contype = 'c';

-- 2. 기존 CHECK 제약 조건 제거
ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_action_type_check;

-- 3. 새로운 CHECK 제약 조건 추가 ('login' 포함)
ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_action_type_check 
    CHECK (action_type IN ('claude_chat', 'post_write', 'login'));

-- 4. 변경 사항 확인
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'usage_logs'::regclass
    AND contype = 'c';

-- 5. 테스트 - login 타입으로 데이터 삽입 (선택사항)
-- INSERT INTO usage_logs (user_email, action_type) 
-- VALUES ('test@example.com', 'login') 
-- RETURNING *;