-- =====================================================
-- User Permissions 테이블 role 제약조건 수정
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: role 체크 제약조건 수정 (teacher 추가)
-- =====================================================

-- Step 1: 기존 체크 제약조건 제거
ALTER TABLE user_permissions 
DROP CONSTRAINT IF EXISTS user_permissions_role_check;

-- Step 2: 새로운 체크 제약조건 추가 (teacher 포함)
ALTER TABLE user_permissions 
ADD CONSTRAINT user_permissions_role_check 
CHECK (role IN ('admin', 'teacher', 'user'));

-- Step 3: 테스트 사용자 추가 (컬럼명 자동 감지)
DO $$ 
DECLARE
  col_name TEXT;
BEGIN
  -- email 또는 user_email 컬럼 확인
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_permissions' 
    AND column_name = 'user_email'
  ) THEN
    -- user_email 컬럼 사용
    INSERT INTO user_permissions (user_email, role, can_write, can_grade, claude_daily_limit)
    VALUES 
      ('hoon@snuecse.org', 'admin', true, true, 100),
      ('hoon@iw.es.kr', 'teacher', true, true, 20),
      ('sociogram@gmail.com', 'user', false, false, 10)
    ON CONFLICT (user_email) DO UPDATE SET
      role = EXCLUDED.role,
      can_write = EXCLUDED.can_write,
      can_grade = EXCLUDED.can_grade,
      claude_daily_limit = EXCLUDED.claude_daily_limit,
      updated_at = NOW();
  ELSE
    -- email 컬럼 사용
    INSERT INTO user_permissions (email, role, can_write, can_grade, claude_daily_limit)
    VALUES 
      ('hoon@snuecse.org', 'admin', true, true, 100),
      ('hoon@iw.es.kr', 'teacher', true, true, 20),
      ('sociogram@gmail.com', 'user', false, false, 10)
    ON CONFLICT (email) DO UPDATE SET
      role = EXCLUDED.role,
      can_write = EXCLUDED.can_write,
      can_grade = EXCLUDED.can_grade,
      claude_daily_limit = EXCLUDED.claude_daily_limit,
      updated_at = NOW();
  END IF;
END $$;

-- Step 4: 결과 확인 (컬럼명 자동 감지)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_permissions' 
    AND column_name = 'user_email'
  ) THEN
    -- user_email 컬럼 사용
    RAISE NOTICE 'Using user_email column';
    PERFORM user_email, role, can_write, can_grade, claude_daily_limit 
    FROM user_permissions 
    ORDER BY role, user_email;
  ELSE
    -- email 컬럼 사용
    RAISE NOTICE 'Using email column';
    PERFORM email, role, can_write, can_grade, claude_daily_limit 
    FROM user_permissions 
    ORDER BY role, email;
  END IF;
END $$;