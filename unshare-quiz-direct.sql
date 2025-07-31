-- 백범일지 퀴즈 공유 취소
-- Quiz ID: 1ea9e972-a363-44b8-9fee-1bd6158e67dc

BEGIN;

-- 1. quizzes 테이블의 is_shared를 false로 업데이트
UPDATE quizzes 
SET is_shared = false
WHERE id = '1ea9e972-a363-44b8-9fee-1bd6158e67dc'
  AND user_email = 'hoon@snuecse.org';

-- 2. shared_quizzes 테이블에서 is_public을 false로 설정 (기록은 보존)
UPDATE shared_quizzes 
SET is_public = false,
    updated_at = NOW()
WHERE quiz_id = '1ea9e972-a363-44b8-9fee-1bd6158e67dc';

-- 3. 업데이트 결과 확인
SELECT 
  q.id,
  q.title,
  q.is_shared as quiz_is_shared,
  sq.is_public as shared_is_public
FROM quizzes q
LEFT JOIN shared_quizzes sq ON sq.quiz_id = q.id
WHERE q.id = '1ea9e972-a363-44b8-9fee-1bd6158e67dc';

COMMIT;

-- 최종 확인: 모든 퀴즈 상태
SELECT 
  id,
  title,
  is_shared,
  created_at
FROM quizzes 
WHERE user_email = 'hoon@snuecse.org' 
  AND (is_sample = false OR is_sample IS NULL)
ORDER BY created_at ASC;