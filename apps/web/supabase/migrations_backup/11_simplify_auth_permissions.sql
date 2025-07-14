-- Simplified authentication fix
-- Temporarily disable RLS to allow auth system to work

-- Disable RLS on user_permissions table
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;

-- Ensure the initial admin user exists
INSERT INTO user_permissions (email, role, claude_daily_limit, can_write) 
VALUES ('hoon@snuecse.org', 'admin', 999999, true)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', claude_daily_limit = 999999, can_write = true;

-- Verify the user was created
SELECT * FROM user_permissions WHERE email = 'hoon@snuecse.org';