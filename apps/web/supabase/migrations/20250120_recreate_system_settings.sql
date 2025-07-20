-- 1. 기존 테이블 백업 (만약을 위해)
CREATE TABLE IF NOT EXISTS system_settings_backup AS 
SELECT * FROM system_settings WHERE EXISTS (SELECT 1 FROM system_settings);

-- 2. 기존 테이블 삭제
DROP TABLE IF EXISTS system_settings CASCADE;

-- 3. 새로운 테이블 생성 (RLS 없이)
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'BlueNote Atelier',
  site_description TEXT DEFAULT '박교수의 연구실 - 교육과 연구의 공간',
  admin_email TEXT DEFAULT 'admin@bluenote.site',
  claude_enabled BOOLEAN DEFAULT true,
  claude_default_daily_limit INTEGER DEFAULT 10,
  claude_system_prompt TEXT DEFAULT '당신은 교육과 연구를 돕는 AI 어시스턴트입니다.',
  claude_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  posts_per_page INTEGER DEFAULT 12,
  enable_comments BOOLEAN DEFAULT false,
  enable_search BOOLEAN DEFAULT true,
  default_categories JSONB DEFAULT '["연구", "교육", "분석", "일상"]'::jsonb,
  session_timeout INTEGER DEFAULT 24,
  max_login_attempts INTEGER DEFAULT 5,
  enable_ip_whitelist BOOLEAN DEFAULT false,
  ip_whitelist JSONB DEFAULT '[]'::jsonb,
  auto_backup BOOLEAN DEFAULT true,
  backup_frequency TEXT DEFAULT 'daily',
  log_retention_days INTEGER DEFAULT 30,
  enable_maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  CONSTRAINT system_settings_single_row CHECK (id = 1)
);

-- 4. 권한 부여
GRANT ALL ON TABLE system_settings TO postgres;
GRANT ALL ON TABLE system_settings TO authenticated;
GRANT ALL ON TABLE system_settings TO service_role;
GRANT ALL ON TABLE system_settings TO anon;

-- 5. 기본 행 삽입
INSERT INTO system_settings (id) VALUES (1);

-- 6. 백업에서 데이터 복구 (있는 경우)
UPDATE system_settings s
SET 
  site_name = b.site_name,
  site_description = b.site_description,
  admin_email = b.admin_email,
  claude_enabled = b.claude_enabled,
  claude_default_daily_limit = b.claude_default_daily_limit,
  claude_system_prompt = b.claude_system_prompt,
  claude_model = b.claude_model,
  posts_per_page = b.posts_per_page,
  enable_comments = b.enable_comments,
  enable_search = b.enable_search,
  default_categories = b.default_categories,
  session_timeout = b.session_timeout,
  max_login_attempts = b.max_login_attempts,
  enable_ip_whitelist = b.enable_ip_whitelist,
  ip_whitelist = b.ip_whitelist,
  auto_backup = b.auto_backup,
  backup_frequency = b.backup_frequency,
  log_retention_days = b.log_retention_days,
  enable_maintenance_mode = b.enable_maintenance_mode
FROM system_settings_backup b
WHERE s.id = 1 AND b.id = 1
AND EXISTS (SELECT 1 FROM system_settings_backup);

-- 7. 백업 테이블 삭제
DROP TABLE IF EXISTS system_settings_backup;

-- 8. 테이블 소유자 변경 (postgres로)
ALTER TABLE system_settings OWNER TO postgres;

-- 9. 확인
SELECT 
    'Table created successfully' as status,
    count(*) as row_count,
    relowner::regrole as owner,
    has_table_privilege('authenticated', 'system_settings', 'INSERT') as can_insert,
    has_table_privilege('service_role', 'system_settings', 'INSERT') as service_can_insert
FROM pg_class, system_settings
WHERE relname = 'system_settings'
GROUP BY relowner;