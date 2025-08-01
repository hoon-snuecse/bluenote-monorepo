-- 샘플 과제 삭제 스크립트
-- 실행 전 반드시 백업을 수행하세요!
-- CASCADE DELETE로 인해 관련된 Submission, Evaluation, SharedAssignment도 함께 삭제됩니다.

-- ============================================
-- 1. 삭제 전 상태 확인
-- ============================================

-- 샘플 과제 목록 확인
SELECT 
    id,
    title,
    "isSample",
    "sampleOrder",
    "sampleCategory",
    "userEmail",
    "createdAt"
FROM "Assignment"
WHERE "isSample" = true
ORDER BY "sampleOrder", "createdAt";

-- 샘플 과제 수 확인
SELECT 
    COUNT(*) as sample_assignment_count
FROM "Assignment"
WHERE "isSample" = true;

-- 샘플 과제에 연결된 데이터 확인
SELECT 
    'Sample Assignments' as data_type,
    COUNT(*) as count
FROM "Assignment"
WHERE "isSample" = true

UNION ALL

SELECT 
    'Submissions for Sample Assignments' as data_type,
    COUNT(*) as count
FROM "Submission" s
JOIN "Assignment" a ON s."assignmentId" = a.id
WHERE a."isSample" = true

UNION ALL

SELECT 
    'Evaluations for Sample Assignments' as data_type,
    COUNT(*) as count
FROM "Evaluation" e
JOIN "Assignment" a ON e."assignmentId" = a.id
WHERE a."isSample" = true

UNION ALL

SELECT 
    'Shared Sample Assignments' as data_type,
    COUNT(*) as count
FROM "SharedAssignment" sa
JOIN "Assignment" a ON sa."assignmentId" = a.id
WHERE a."isSample" = true;

-- ============================================
-- 2. 샘플 과제 삭제 (CASCADE DELETE)
-- ============================================

-- 샘플 과제 삭제 (관련 데이터 자동 삭제됨)
DELETE FROM "Assignment"
WHERE "isSample" = true;

-- ============================================
-- 3. 삭제 후 상태 확인
-- ============================================

-- 남은 과제 확인
SELECT 
    'Total Assignments Remaining' as check_type,
    COUNT(*) as count
FROM "Assignment"

UNION ALL

SELECT 
    'Sample Assignments Remaining' as check_type,
    COUNT(*) as count
FROM "Assignment"
WHERE "isSample" = true

UNION ALL

SELECT 
    'Non-Sample Assignments' as check_type,
    COUNT(*) as count
FROM "Assignment"
WHERE "isSample" = false OR "isSample" IS NULL;

-- 남은 과제 목록
SELECT 
    id,
    title,
    "isSample",
    "userEmail",
    "createdAt"
FROM "Assignment"
ORDER BY "createdAt" DESC;

-- ============================================
-- 4. 전체 데이터 상태 확인
-- ============================================

SELECT 
    'Total Assignments' as data_type,
    COUNT(*) as count
FROM "Assignment"

UNION ALL

SELECT 
    'Total Submissions' as data_type,
    COUNT(*) as count
FROM "Submission"

UNION ALL

SELECT 
    'Total Evaluations' as data_type,
    COUNT(*) as count
FROM "Evaluation"

UNION ALL

SELECT 
    'Total Shared Assignments' as data_type,
    COUNT(*) as count
FROM "SharedAssignment";

-- ============================================
-- 롤백 스크립트
-- ============================================
/*
-- 주의: 삭제된 데이터는 복구할 수 없습니다.
-- 백업에서 복원해야 합니다.
*/