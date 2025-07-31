-- 기존 공유된 퀴즈들의 is_shared 필드를 true로 업데이트
-- shared_quizzes 테이블에서 is_public=true인 퀴즈들을 찾아서 업데이트

-- 1. 먼저 업데이트 대상 확인
SELECT 
  q.id,
  q.title,
  q.is_shared,
  sq.is_public,
  sq.created_at as shared_at
FROM quizzes q
JOIN shared_quizzes sq ON sq.quiz_id = q.id
WHERE sq.is_public = true
  AND (q.is_shared = false OR q.is_shared IS NULL);

-- 2. is_shared 필드 업데이트
UPDATE quizzes 
SET is_shared = true
WHERE id IN (
  SELECT quiz_id 
  FROM shared_quizzes 
  WHERE is_public = true
)
AND (is_shared = false OR is_shared IS NULL);

-- 3. 업데이트 결과 확인
SELECT 
  COUNT(*) as total_shared_quizzes,
  SUM(CASE WHEN q.is_shared = true THEN 1 ELSE 0 END) as quizzes_with_is_shared_true,
  SUM(CASE WHEN q.is_shared = false OR q.is_shared IS NULL THEN 1 ELSE 0 END) as quizzes_with_is_shared_false
FROM quizzes q
JOIN shared_quizzes sq ON sq.quiz_id = q.id
WHERE sq.is_public = true;