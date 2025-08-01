-- 현재 과제 상태 확인

-- 1. 전체 과제 목록과 isSample 필드 값 확인
SELECT 
    id,
    title,
    "isSample",
    "sampleOrder",
    "sampleCategory",
    "userEmail",
    "createdAt"
FROM "Assignment"
ORDER BY "createdAt" DESC;

-- 2. isSample 필드 값별 집계
SELECT 
    CASE 
        WHEN "isSample" = true THEN 'Sample (true)'
        WHEN "isSample" = false THEN 'Non-Sample (false)'
        WHEN "isSample" IS NULL THEN 'NULL'
    END as sample_status,
    COUNT(*) as count
FROM "Assignment"
GROUP BY "isSample";

-- 3. 전체 과제 수
SELECT COUNT(*) as total_assignments FROM "Assignment";