-- 기존 데이터 정리: userId가 없는 과제와 평가들 수정 (최종 버전)
-- User 테이블의 password 필드를 포함한 버전
-- 실행 전 반드시 백업을 수행하세요!

-- ============================================
-- 1. User 테이블 확인 및 사용자 생성
-- ============================================

-- User 테이블 상태 확인
SELECT COUNT(*) as user_count FROM "User";

-- hoon@snuecse.org 사용자가 있는지 확인
SELECT id, email, name 
FROM "User" 
WHERE email = 'hoon@snuecse.org';

-- 사용자가 없으면 생성 (임시 비밀번호 포함)
-- 비밀번호는 'temp123!' 의 bcrypt 해시값입니다
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'hoon@snuecse.org',
    '$2a$10$K4JxqRXH8xVVdxPmCb4hBuqWlKUGPfwMQe5Te.hW8q8QYZhHMOEXO', -- temp123! 의 bcrypt 해시
    'Hoon',
    'TEACHER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "User" WHERE email = 'hoon@snuecse.org'
);

-- 생성된 사용자 확인
SELECT id, email, name, role 
FROM "User" 
WHERE email = 'hoon@snuecse.org';

-- ============================================
-- 2. Assignment 테이블 업데이트
-- ============================================

-- userId가 없는 과제 수 확인
SELECT COUNT(*) as assignments_without_userid
FROM "Assignment"
WHERE "userId" IS NULL;

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

-- userId가 없는 평가 수 확인
SELECT COUNT(*) as evaluations_without_userid
FROM "Evaluation"
WHERE "userId" IS NULL;

-- evaluatedByUser가 있는 평가들 확인
SELECT 
    COUNT(*) as count,
    "evaluatedByUser"
FROM "Evaluation"
WHERE "userId" IS NULL 
AND "evaluatedByUser" IS NOT NULL
GROUP BY "evaluatedByUser";

-- 모든 userId가 없는 평가들을 hoon@snuecse.org로 설정
UPDATE "Evaluation"
SET 
    "userId" = (SELECT id FROM "User" WHERE email = 'hoon@snuecse.org' LIMIT 1),
    "evaluatedByUser" = COALESCE("evaluatedByUser", 'hoon@snuecse.org')
WHERE "userId" IS NULL;

-- ============================================
-- 4. 최종 결과 확인
-- ============================================

-- 전체 데이터 상태 확인
SELECT 
    'Total Users' as check_type,
    COUNT(*) as count
FROM "User"

UNION ALL

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
FROM "Evaluation" e
JOIN "User" u ON e."userId" = u.id
WHERE u.email = 'hoon@snuecse.org'

UNION ALL

SELECT 
    'Total Assignments' as check_type,
    COUNT(*) as count
FROM "Assignment"

UNION ALL

SELECT 
    'Total Evaluations' as check_type,
    COUNT(*) as count
FROM "Evaluation";

-- ============================================
-- 5. 샘플 과제들의 소유자 확인
-- ============================================

-- 샘플 과제들이 제대로 소유자가 설정되었는지 확인
SELECT 
    a.id,
    a.title,
    a."isSample",
    a."userId",
    a."userEmail",
    a."createdAt",
    u.email as user_email_from_join
FROM "Assignment" a
LEFT JOIN "User" u ON a."userId" = u.id
WHERE a."isSample" = true
ORDER BY a."createdAt" DESC;

-- ============================================
-- 6. 외래키 제약조건 확인
-- ============================================

-- Assignment 테이블의 외래키가 유효한지 확인
SELECT 
    'Invalid Assignment userId' as check_type,
    COUNT(*) as count
FROM "Assignment" a
LEFT JOIN "User" u ON a."userId" = u.id
WHERE a."userId" IS NOT NULL AND u.id IS NULL;

-- Evaluation 테이블의 외래키가 유효한지 확인
SELECT 
    'Invalid Evaluation userId' as check_type,
    COUNT(*) as count
FROM "Evaluation" e
LEFT JOIN "User" u ON e."userId" = u.id
WHERE e."userId" IS NOT NULL AND u.id IS NULL;