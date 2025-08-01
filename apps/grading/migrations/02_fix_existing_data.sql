-- 기존 데이터 정리: userId가 없는 과제와 평가들 수정
-- 실행 전 반드시 백업을 수행하세요!

-- ============================================
-- 1. 사용자 정보 확인
-- ============================================

-- hoon@snuecse.org 사용자 정보 확인
SELECT id, email, name 
FROM "User" 
WHERE email = 'hoon@snuecse.org';

-- ============================================
-- 2. Assignment 테이블 업데이트
-- ============================================

-- userId가 없는 과제들을 hoon@snuecse.org 소유로 변경
UPDATE "Assignment" 
SET 
    "userId" = (SELECT id FROM "User" WHERE email = 'hoon@snuecse.org' LIMIT 1),
    "userEmail" = 'hoon@snuecse.org'
WHERE "userId" IS NULL;

-- 업데이트 결과 확인
SELECT 
    'Assignments updated' as operation,
    COUNT(*) as count
FROM "Assignment"
WHERE "userEmail" = 'hoon@snuecse.org';

-- ============================================
-- 3. Evaluation 테이블 업데이트
-- ============================================

-- userId가 없지만 evaluatedByUser가 있는 평가들 확인
SELECT 
    id,
    "evaluatedByUser",
    "evaluatedAt",
    "assignmentId"
FROM "Evaluation"
WHERE "userId" IS NULL 
AND "evaluatedByUser" IS NOT NULL
LIMIT 10;

-- evaluatedByUser를 기반으로 userId 업데이트
UPDATE "Evaluation" e
SET "userId" = u.id
FROM "User" u
WHERE e."evaluatedByUser" = u.email
AND e."userId" IS NULL
AND e."evaluatedByUser" IS NOT NULL;

-- evaluatedByUser도 없는 평가들은 hoon@snuecse.org로 설정
UPDATE "Evaluation"
SET 
    "userId" = (SELECT id FROM "User" WHERE email = 'hoon@snuecse.org' LIMIT 1),
    "evaluatedByUser" = 'hoon@snuecse.org'
WHERE "userId" IS NULL 
AND "evaluatedByUser" IS NULL;

-- ============================================
-- 4. 최종 결과 확인
-- ============================================

-- 전체 데이터 상태 확인
SELECT 
    'Assignments without userId' as check_type,
    COUNT(*) as count
FROM "Assignment"
WHERE "userId" IS NULL

UNION ALL

SELECT 
    'Assignments owned by hoon@snuecse.org' as check_type,
    COUNT(*) as count
FROM "Assignment"
WHERE "userEmail" = 'hoon@snuecse.org'

UNION ALL

SELECT 
    'Evaluations without userId' as check_type,
    COUNT(*) as count
FROM "Evaluation"
WHERE "userId" IS NULL

UNION ALL

SELECT 
    'Evaluations by hoon@snuecse.org' as check_type,
    COUNT(*) as count
FROM "Evaluation"
WHERE "evaluatedByUser" = 'hoon@snuecse.org'

UNION ALL

SELECT 
    'Total User count' as check_type,
    COUNT(*) as count
FROM "User";

-- ============================================
-- 5. 샘플 과제들의 소유자 확인
-- ============================================

-- 샘플 과제들이 제대로 소유자가 설정되었는지 확인
SELECT 
    id,
    title,
    "isSample",
    "userId",
    "userEmail",
    "createdAt"
FROM "Assignment"
WHERE "isSample" = true
ORDER BY "createdAt" DESC;

-- ============================================
-- 롤백 스크립트 (필요시 사용)
-- ============================================
/*
-- Assignment 롤백
UPDATE "Assignment" 
SET 
    "userId" = NULL,
    "userEmail" = NULL
WHERE "userEmail" = 'hoon@snuecse.org' 
AND "createdAt" < '2024-01-01'; -- 특정 날짜 이전 것만 롤백

-- Evaluation 롤백
UPDATE "Evaluation"
SET "userId" = NULL
WHERE "evaluatedByUser" = 'hoon@snuecse.org'
AND "evaluatedAt" < '2024-01-01'; -- 특정 날짜 이전 것만 롤백
*/