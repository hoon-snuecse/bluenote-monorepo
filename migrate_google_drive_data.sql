-- 기존 Google Drive URL 데이터 마이그레이션
-- 실행 전 백업 권장

-- 1. 마이그레이션 전 상태 확인
SELECT COUNT(*) as total_google_drive_urls
FROM "Submission"
WHERE ("studentId" LIKE '%google.com%' 
   OR "studentId" LIKE '%drive.google%'
   OR "studentId" LIKE 'http%')
   AND "documentPath" IS NULL;

-- 2. 데이터 마이그레이션 실행
UPDATE "Submission"
SET 
    "documentPath" = "studentId",
    "sourceType" = 'GOOGLE_DRIVE',
    "studentId" = CONCAT('DRIVE_', SUBSTRING(MD5("studentId"), 1, 8))
WHERE ("studentId" LIKE '%google.com%' 
   OR "studentId" LIKE '%drive.google%'
   OR "studentId" LIKE 'http%')
   AND "documentPath" IS NULL;

-- 3. 마이그레이션 결과 확인
SELECT 
    "id",
    "studentName",
    "studentId",
    "documentPath",
    "sourceType",
    "submittedAt"
FROM "Submission"
WHERE "sourceType" = 'GOOGLE_DRIVE'
ORDER BY "submittedAt" DESC
LIMIT 20;