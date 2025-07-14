-- Simple user permissions table creation without indexes

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

-- Add initial admin user
INSERT INTO user_permissions (email, role, claude_daily_limit, can_write) 
VALUES ('hoon@snuecse.org', 'admin', 999999, true);

-- Verify
SELECT * FROM user_permissions;