-- User 테이블에서 불필요한 password 필드 제거
-- grading 앱은 web 앱의 인증을 사용하므로 자체 비밀번호가 필요없음

-- ============================================
-- 1. password 필드 제거
-- ============================================

ALTER TABLE "User" 
DROP COLUMN IF EXISTS "password";

-- ============================================
-- 2. 결과 확인
-- ============================================

-- User 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- 기존 사용자 데이터 확인
SELECT id, email, name, role, "isActive"
FROM "User";

-- ============================================
-- 롤백 스크립트 (필요시 사용)
-- ============================================
/*
-- password 필드 다시 추가
ALTER TABLE "User" 
ADD COLUMN "password" TEXT NOT NULL DEFAULT 'temp';

-- 기본값 제거
ALTER TABLE "User" 
ALTER COLUMN "password" DROP DEFAULT;
*/