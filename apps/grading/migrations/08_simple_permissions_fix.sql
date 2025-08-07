-- =====================================================
-- User Permissions 간단한 수정 스크립트
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: user_permissions 테이블 권한 설정
-- =====================================================

-- Step 1: 현재 테이블 구조 확인
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'user_permissions'
ORDER BY ordinal_position;

-- Step 2: role 제약조건 수정 (teacher 포함)
ALTER TABLE user_permissions 
DROP CONSTRAINT IF EXISTS user_permissions_role_check;

ALTER TABLE user_permissions 
ADD CONSTRAINT user_permissions_role_check 
CHECK (role IN ('admin', 'teacher', 'user'));

-- Step 3: can_grade 컬럼 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_permissions' 
    AND column_name = 'can_grade'
  ) THEN
    ALTER TABLE user_permissions ADD COLUMN can_grade BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Step 4: 관리자 권한 설정 (user_email 컬럼 사용)
-- 주의: 실제 컬럼명에 맞게 수정 필요
UPDATE user_permissions 
SET 
  role = 'admin',
  can_write = true,
  can_grade = true,
  claude_daily_limit = 100
WHERE user_email = 'hoon@snuecse.org';

-- Step 5: RLS 및 권한 설정
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "API access only" ON user_permissions;
CREATE POLICY "API access only" ON user_permissions 
  FOR ALL 
  USING (false)
  WITH CHECK (false);

GRANT ALL ON TABLE user_permissions TO service_role;

-- Step 6: 최종 데이터 확인
SELECT * FROM user_permissions;