-- =====================================================
-- User Permissions 테이블 컬럼 수정
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: user_permissions 테이블의 컬럼명 통일
-- =====================================================

-- Step 1: 기존 테이블 구조 확인 및 수정
-- email 컬럼을 user_email로 변경 (이미 email이 있는 경우)
DO $$ 
BEGIN
  -- email 컬럼이 있고 user_email이 없으면 이름 변경
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_permissions' 
    AND column_name = 'email'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_permissions' 
    AND column_name = 'user_email'
  ) THEN
    ALTER TABLE user_permissions RENAME COLUMN email TO user_email;
  END IF;
END $$;

-- Step 2: 필요한 컬럼 추가 (없는 경우만)
DO $$ 
BEGIN
  -- can_grade 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_permissions' 
    AND column_name = 'can_grade'
  ) THEN
    ALTER TABLE user_permissions ADD COLUMN can_grade BOOLEAN DEFAULT false;
  END IF;
  
  -- created_at 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_permissions' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_permissions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- updated_at 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_permissions' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_permissions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Step 3: 기본 관리자 계정 설정 (user_email 컬럼 사용)
INSERT INTO user_permissions (user_email, role, can_write, can_grade, claude_daily_limit)
VALUES ('hoon@snuecse.org', 'admin', true, true, 100)
ON CONFLICT (user_email) 
DO UPDATE SET 
  role = 'admin',
  can_write = true,
  can_grade = true,
  claude_daily_limit = 100,
  updated_at = NOW();

-- Step 4: RLS 정책 확인 및 추가
DO $$ 
BEGIN
  -- 기존 정책 제거
  DROP POLICY IF EXISTS "API access only" ON user_permissions;
  DROP POLICY IF EXISTS "Block everyone on user_permissions" ON user_permissions;
  
  -- RLS 활성화
  ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
END $$;

-- API 전용 정책 추가
CREATE POLICY "API access only" ON user_permissions 
  FOR ALL 
  USING (false)
  WITH CHECK (false);

-- Step 5: Service Role 권한 부여
GRANT ALL ON TABLE user_permissions TO service_role;

-- Step 6: 테스트 사용자 추가
INSERT INTO user_permissions (user_email, role, can_write, can_grade, claude_daily_limit)
VALUES 
  ('hoon@iw.es.kr', 'teacher', true, true, 20),
  ('sociogram@gmail.com', 'user', false, false, 10)
ON CONFLICT (user_email) DO UPDATE SET
  can_grade = EXCLUDED.can_grade,
  updated_at = NOW();

-- Step 7: 최종 구조 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_permissions'
ORDER BY ordinal_position;

-- Step 8: 데이터 확인
SELECT user_email, role, can_write, can_grade, claude_daily_limit 
FROM user_permissions 
ORDER BY role DESC, user_email;