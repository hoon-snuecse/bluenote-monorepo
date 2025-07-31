-- hoon@snuecse.org가 만든 퀴즈 5개를 제작 순서대로 조회
SELECT 
  id,
  title,
  created_at,
  is_shared,
  is_sample
FROM quizzes 
WHERE user_email = 'hoon@snuecse.org' 
  AND (is_sample = false OR is_sample IS NULL)
ORDER BY created_at ASC;