-- Check current state and fix permissions

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'user_permissions'
);

-- Check current RLS status
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'user_permissions';

-- Check existing users
SELECT * FROM user_permissions;

-- If no admin exists, create one
INSERT INTO user_permissions (email, role, claude_daily_limit, can_write) 
VALUES ('hoon@snuecse.org', 'admin', 999999, true)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', claude_daily_limit = 999999, can_write = true;

-- Disable RLS to ensure auth works
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT * FROM user_permissions WHERE email = 'hoon@snuecse.org';