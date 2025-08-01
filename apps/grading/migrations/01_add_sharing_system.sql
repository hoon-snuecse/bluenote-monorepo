-- 1단계: 과제 공유 기능을 위한 데이터베이스 스키마 업데이트
-- 실행 전 반드시 백업을 수행하세요!

-- ============================================
-- 1. Assignment 테이블에 권한 관련 필드 추가
-- ============================================

-- userId 필드 추가 (nullable)
ALTER TABLE "Assignment" 
ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- userEmail 필드 추가 (nullable)
ALTER TABLE "Assignment" 
ADD COLUMN IF NOT EXISTS "userEmail" TEXT;

-- isShared 필드 추가 (기본값 false)
ALTER TABLE "Assignment" 
ADD COLUMN IF NOT EXISTS "isShared" BOOLEAN DEFAULT false NOT NULL;

-- sharedAt 필드 추가 (nullable)
ALTER TABLE "Assignment" 
ADD COLUMN IF NOT EXISTS "sharedAt" TIMESTAMP(3);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS "Assignment_userId_idx" ON "Assignment"("userId");
CREATE INDEX IF NOT EXISTS "Assignment_userEmail_idx" ON "Assignment"("userEmail");
CREATE INDEX IF NOT EXISTS "Assignment_isShared_idx" ON "Assignment"("isShared");

-- ============================================
-- 2. SharedAssignment 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS "SharedAssignment" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "sharedToEmail" TEXT NOT NULL,
    "sharedByEmail" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'read',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedAssignment_pkey" PRIMARY KEY ("id")
);

-- 유니크 제약조건 (한 과제를 같은 사용자에게 중복 공유 방지)
CREATE UNIQUE INDEX IF NOT EXISTS "SharedAssignment_assignmentId_sharedToEmail_key" 
ON "SharedAssignment"("assignmentId", "sharedToEmail");

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS "SharedAssignment_sharedToEmail_idx" ON "SharedAssignment"("sharedToEmail");
CREATE INDEX IF NOT EXISTS "SharedAssignment_sharedByEmail_idx" ON "SharedAssignment"("sharedByEmail");

-- 외래키 제약조건 추가
ALTER TABLE "SharedAssignment" 
ADD CONSTRAINT "SharedAssignment_assignmentId_fkey" 
FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 3. Evaluation 테이블에 userId 필드 추가
-- ============================================

ALTER TABLE "Evaluation" 
ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS "Evaluation_userId_idx" ON "Evaluation"("userId");

-- ============================================
-- 4. 기존 데이터 마이그레이션
-- ============================================

-- 기존 과제들에 대해 NULL 값 유지 (외래키 제약조건 때문에)
-- userId와 userEmail은 NULL로 유지하고, 나중에 적절한 사용자로 업데이트

-- 기존 평가들의 userId 설정 (evaluatedByUser를 기반으로)
-- User 테이블에서 email로 userId 찾아서 설정
UPDATE "Evaluation" e
SET "userId" = (
    SELECT u.id 
    FROM "User" u 
    WHERE u.email = e."evaluatedByUser"
    LIMIT 1
)
WHERE e."evaluatedByUser" IS NOT NULL 
AND e."userId" IS NULL;

-- ============================================
-- 5. 외래키 제약조건 추가 (User 관계)
-- ============================================

-- Assignment-User 관계
ALTER TABLE "Assignment" 
ADD CONSTRAINT "Assignment_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Evaluation-User 관계
ALTER TABLE "Evaluation" 
ADD CONSTRAINT "Evaluation_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- 6. 데이터 확인 쿼리
-- ============================================

-- 마이그레이션 결과 확인
SELECT 
    'Assignments without userId' as check_type,
    COUNT(*) as count
FROM "Assignment"
WHERE "userId" IS NULL

UNION ALL

SELECT 
    'Evaluations with userEmail but no userId' as check_type,
    COUNT(*) as count
FROM "Evaluation"
WHERE "evaluatedByUser" IS NOT NULL AND "userId" IS NULL

UNION ALL

SELECT 
    'Total SharedAssignments' as check_type,
    COUNT(*) as count
FROM "SharedAssignment";

-- ============================================
-- 롤백 스크립트 (필요시 사용)
-- ============================================
/*
-- SharedAssignment 테이블 삭제
DROP TABLE IF EXISTS "SharedAssignment";

-- Assignment 테이블 필드 제거
ALTER TABLE "Assignment" 
DROP COLUMN IF EXISTS "userId",
DROP COLUMN IF EXISTS "userEmail",
DROP COLUMN IF EXISTS "isShared",
DROP COLUMN IF EXISTS "sharedAt";

-- Evaluation 테이블 필드 제거
ALTER TABLE "Evaluation" 
DROP COLUMN IF EXISTS "userId";

-- 인덱스 제거
DROP INDEX IF EXISTS "Assignment_userId_idx";
DROP INDEX IF EXISTS "Assignment_userEmail_idx";
DROP INDEX IF EXISTS "Assignment_isShared_idx";
DROP INDEX IF EXISTS "Evaluation_userId_idx";
*/