-- 특정 사용자의 평가 데이터 확인
SELECT 
    id,
    assignmentId,
    evaluatedBy,
    evaluatedByUser,
    userId,
    evaluatedAt
FROM "Evaluation"
WHERE evaluatedByUser = 'hoon@iw.es.kr'
ORDER BY evaluatedAt DESC;

-- 전체 평가 데이터 통계
SELECT 
    evaluatedByUser,
    evaluatedBy,
    COUNT(*) as count
FROM "Evaluation"
WHERE evaluatedByUser IS NOT NULL
GROUP BY evaluatedByUser, evaluatedBy
ORDER BY count DESC;
