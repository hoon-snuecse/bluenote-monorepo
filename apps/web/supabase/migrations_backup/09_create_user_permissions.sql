-- Create user permissions table for managing user access and limits
CREATE TABLE IF NOT EXISTS user_permissions (
  email TEXT PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  claude_daily_limit INTEGER DEFAULT 3,
  can_write BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage logs table for tracking user actions (privacy-minimized)
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT REFERENCES user_permissions(email) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('claude_chat', 'post_write', 'post_edit', 'post_delete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_permissions_email ON user_permissions(email);
CREATE INDEX idx_user_permissions_role ON user_permissions(role);
CREATE INDEX idx_usage_logs_user_date ON usage_logs(user_email, created_at);
CREATE INDEX idx_usage_logs_action_type ON usage_logs(action_type, created_at);

-- Enable Row Level Security
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_permissions
-- Only admins can view all user permissions
CREATE POLICY "Admins can view all user permissions" 
  ON user_permissions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions" 
  ON user_permissions FOR SELECT 
  USING (email = auth.jwt() ->> 'email');

-- Only admins can insert/update/delete user permissions
CREATE POLICY "Only admins can manage user permissions" 
  ON user_permissions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- RLS Policies for usage_logs
-- Users can view their own logs
CREATE POLICY "Users can view own usage logs" 
  ON usage_logs FOR SELECT 
  USING (user_email = auth.jwt() ->> 'email');

-- Admins can view all logs
CREATE POLICY "Admins can view all usage logs" 
  ON usage_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- System can insert logs (via service role)
CREATE POLICY "System can insert usage logs" 
  ON usage_logs FOR INSERT 
  WITH CHECK (true);

-- Only admins can delete logs (for privacy compliance)
CREATE POLICY "Only admins can delete usage logs" 
  ON usage_logs FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- Insert initial admin user
INSERT INTO user_permissions (email, role, claude_daily_limit, can_write) 
VALUES ('hoon@snuecse.org', 'admin', 999999, true)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', claude_daily_limit = 999999, can_write = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set search path to empty to prevent SQL injection
  SET search_path = '';
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_permissions_updated_at 
  BEFORE UPDATE ON user_permissions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_user_permissions_updated_at();

-- Create view for daily usage summary (for dashboard)
CREATE OR REPLACE VIEW daily_usage_summary AS
SELECT 
  user_email,
  action_type,
  DATE(created_at) as usage_date,
  COUNT(*) as action_count
FROM usage_logs
GROUP BY user_email, action_type, DATE(created_at);

-- Grant permissions for the view
GRANT SELECT ON daily_usage_summary TO authenticated;