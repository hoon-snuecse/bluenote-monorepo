-- Create user permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_permissions (
  email TEXT PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  claude_daily_limit INTEGER DEFAULT 3,
  can_write BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT REFERENCES user_permissions(email) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('claude_chat', 'post_write', 'post_edit', 'post_delete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now set up the permissions correctly

-- 1. First, ensure hoon@snuecse.org is properly set as admin
INSERT INTO user_permissions (email, role, can_write, claude_daily_limit, created_at, updated_at)
VALUES (
    'hoon@snuecse.org',
    'admin',
    true,
    100,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'admin',
    can_write = true,
    claude_daily_limit = 100,
    updated_at = NOW();

-- 2. Set hoon@iw.es.kr as regular user with limited permissions
INSERT INTO user_permissions (email, role, can_write, claude_daily_limit, created_at, updated_at)
VALUES (
    'hoon@iw.es.kr',
    'user',
    false,  -- No write permission
    10,     -- Limited Claude usage
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'user',
    can_write = false,
    claude_daily_limit = 10,
    updated_at = NOW();

-- 3. If sociogram@gmail.com exists, set as regular user
INSERT INTO user_permissions (email, role, can_write, claude_daily_limit, created_at, updated_at)
VALUES (
    'sociogram@gmail.com',
    'user',
    false,
    10,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'user',
    can_write = false,
    claude_daily_limit = 10,
    updated_at = NOW();

-- 4. View current permissions
SELECT email, role, can_write, claude_daily_limit 
FROM user_permissions 
ORDER BY role DESC, email;