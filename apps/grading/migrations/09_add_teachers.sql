-- =====================================================
-- 교사 권한 부여
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: 특정 사용자들에게 교사 권한 부여
-- =====================================================

-- hoon@iw.es.kr에게 교사 권한 부여
UPDATE user_permissions 
SET 
  role = 'teacher',
  can_write = true,
  can_grade = true,
  claude_daily_limit = 20,
  updated_at = NOW()
WHERE user_email = 'hoon@iw.es.kr';

-- 필요시 다른 사용자에게도 교사 권한 부여 가능
-- UPDATE user_permissions 
-- SET 
--   role = 'teacher',
--   can_write = true,
--   can_grade = true,
--   claude_daily_limit = 20,
--   updated_at = NOW()
-- WHERE user_email IN ('email1@example.com', 'email2@example.com');

-- 결과 확인
SELECT 
  user_email,
  role,
  can_write,
  can_grade,
  claude_daily_limit
FROM user_permissions 
WHERE role IN ('admin', 'teacher')
ORDER BY role, user_email;