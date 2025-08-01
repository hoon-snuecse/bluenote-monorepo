-- 샘플 과제 삭제 스크립트
-- 실행 전 반드시 백업을 권장합니다!

-- 1. 먼저 삭제될 데이터 확인
-- 샘플 과제 목록 확인
SELECT 
    a.id,
    a.title,
    a."sampleCategory",
    COUNT(DISTINCT s.id) as submission_count,
    COUNT(DISTINCT e.id) as evaluation_count
FROM "Assignment" a
LEFT JOIN "Submission" s ON s."assignmentId" = a.id
LEFT JOIN "Evaluation" e ON e."submissionId" = s.id
WHERE a."isSample" = true
GROUP BY a.id, a.title, a."sampleCategory"
ORDER BY a."sampleOrder";

-- 2. 삭제될 관련 데이터 수 확인
SELECT 
    'Assignments' as table_name,
    COUNT(*) as count
FROM "Assignment"
WHERE "isSample" = true
UNION ALL
SELECT 
    'Submissions' as table_name,
    COUNT(*) as count
FROM "Submission" s
INNER JOIN "Assignment" a ON s."assignmentId" = a.id
WHERE a."isSample" = true
UNION ALL
SELECT 
    'Evaluations' as table_name,
    COUNT(*) as count
FROM "Evaluation" e
INNER JOIN "Submission" s ON e."submissionId" = s.id
INNER JOIN "Assignment" a ON s."assignmentId" = a.id
WHERE a."isSample" = true;

-- 3. 백업용 SELECT 문 (결과를 CSV나 JSON으로 내보내기 가능)
-- 과제 데이터 백업
SELECT * FROM "Assignment" WHERE "isSample" = true;

-- 제출물 데이터 백업 (있는 경우)
SELECT s.* 
FROM "Submission" s
INNER JOIN "Assignment" a ON s."assignmentId" = a.id
WHERE a."isSample" = true;

-- 평가 데이터 백업 (있는 경우)
SELECT e.*
FROM "Evaluation" e
INNER JOIN "Submission" s ON e."submissionId" = s.id
INNER JOIN "Assignment" a ON s."assignmentId" = a.id
WHERE a."isSample" = true;

-- ============================================
-- 위 쿼리들을 실행하여 데이터를 확인하고 백업한 후
-- 아래 DELETE 문을 실행하세요
-- ============================================

-- 4. 샘플 과제 삭제 (CASCADE로 관련 데이터 자동 삭제)
-- 주의: 이 쿼리는 실행하면 되돌릴 수 없습니다!
-- DELETE FROM "Assignment" WHERE "isSample" = true;

-- 5. 삭제 후 확인
-- SELECT COUNT(*) as remaining_sample_count FROM "Assignment" WHERE "isSample" = true;