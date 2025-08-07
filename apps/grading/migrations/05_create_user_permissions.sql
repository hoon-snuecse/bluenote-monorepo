-- =====================================================
-- User Permissions 테이블 생성 (Grading 앱용)
-- =====================================================
-- 실행 날짜: 2025-01-08
-- 목적: Grading 앱에서 사용자 권한 관리를 위한 테이블 생성
-- =====================================================

-- Step 1: user_permissions 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS user_permissions (
  user_email TEXT PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'teacher', 'user')),
  can_write BOOLEAN DEFAULT false,
  can_grade BOOLEAN DEFAULT false,
  claude_daily_limit INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: 기본 관리자 계정 설정
INSERT INTO user_permissions (user_email, role, can_write, can_grade, claude_daily_limit)
VALUES ('hoon@snuecse.org', 'admin', true, true, 100)
ON CONFLICT (user_email) 
DO UPDATE SET 
  role = 'admin',
  can_write = true,
  can_grade = true,
  claude_daily_limit = 100,
  updated_at = NOW();

-- Step 3: RLS 활성화 (보안을 위해)
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Step 4: API 전용 정책 추가 (직접 접근 차단)
-- 모든 직접 클라이언트 접근 차단, Service Role만 허용
CREATE POLICY "API access only" ON user_permissions 
  FOR ALL 
  USING (false)
  WITH CHECK (false);

-- Step 5: Service Role 권한 부여
GRANT ALL ON TABLE user_permissions TO service_role;

-- Step 6: 테스트 사용자 추가 (필요시)
INSERT INTO user_permissions (user_email, role, can_write, can_grade, claude_daily_limit)
VALUES 
  ('hoon@iw.es.kr', 'teacher', true, true, 20),
  ('sociogram@gmail.com', 'user', false, false, 10)
ON CONFLICT (user_email) DO NOTHING;

-- Step 7: 확인
SELECT user_email, role, can_write, can_grade, claude_daily_limit 
FROM user_permissions 
ORDER BY role DESC, user_email;