-- 샘플 과제 삭제 최종 스크립트
-- 백업 데이터가 이미 확보되었으므로 삭제를 진행할 수 있습니다

-- 현재 샘플 과제 현황:
-- 1. [샘플] 초등학교 독후감 과제 (ID: sample-elem-book-report)
-- 2. [샘플] 중학교 영어 에세이 (ID: sample-middle-english-essay)
-- 3. [샘플] 고등학교 논술 - AI와 미래 사회 (ID: sample-high-essay)
-- 연관된 제출물이나 평가 데이터는 없음

-- 삭제 전 최종 확인
SELECT 
    id,
    title,
    "isSample",
    "sampleCategory"
FROM "Assignment" 
WHERE "isSample" = true
ORDER BY "sampleOrder";

-- 샘플 과제 삭제 실행
-- CASCADE 옵션으로 연관 데이터가 있더라도 자동 삭제됨
DELETE FROM "Assignment" WHERE "isSample" = true;

-- 삭제 후 확인
SELECT 
    COUNT(*) as remaining_sample_count 
FROM "Assignment" 
WHERE "isSample" = true;

-- 전체 과제 수 확인
SELECT 
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN "isSample" = true THEN 1 END) as sample_assignments,
    COUNT(CASE WHEN "isSample" = false OR "isSample" IS NULL THEN 1 END) as regular_assignments
FROM "Assignment";