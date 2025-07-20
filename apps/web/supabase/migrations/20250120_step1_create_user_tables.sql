-- Step 1: Create tables only

-- Drop existing tables if they exist (be careful!)
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;

-- Create user permissions table
CREATE TABLE user_permissions (
  email TEXT PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  claude_daily_limit INTEGER DEFAULT 3,
  can_write BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage logs table
CREATE TABLE usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT REFERENCES user_permissions(email) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('claude_chat', 'post_write', 'post_edit', 'post_delete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON user_permissions TO authenticated;
GRANT ALL ON user_permissions TO service_role;
GRANT ALL ON user_permissions TO anon;

GRANT ALL ON usage_logs TO authenticated;
GRANT ALL ON usage_logs TO service_role;
GRANT ALL ON usage_logs TO anon;

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_permissions', 'usage_logs');