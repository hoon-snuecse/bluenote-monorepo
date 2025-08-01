-- 1. 시작 전 상태 확인
SELECT 
    id,
    title,
    isShared,
    sharedAt,
    userEmail
FROM "Assignment"
WHERE title LIKE '%설명하는 글쓰기%'
LIMIT 1;

-- SharedAssignment 테이블 확인
SELECT 
    sa.id,
    sa.assignmentId,
    sa.sharedByEmail,
    sa.sharedToEmail,
    sa.permission,
    sa.sharedAt
FROM "SharedAssignment" sa
JOIN "Assignment" a ON sa.assignmentId = a.id
WHERE a.title LIKE '%설명하는 글쓰기%';
