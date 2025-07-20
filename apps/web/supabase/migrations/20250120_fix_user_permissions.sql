-- Fix user permissions - remove admin access from regular users

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