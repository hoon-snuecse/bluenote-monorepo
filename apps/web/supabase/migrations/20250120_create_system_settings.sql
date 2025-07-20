-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
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

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy: admins can read and update
CREATE POLICY "Admins can read system settings" ON system_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update system settings" ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'admin'
    )
  );

-- Insert default row if not exists
INSERT INTO system_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';