-- Step 2: Insert user data (run after step 1)

-- 1. Insert admin user
INSERT INTO user_permissions (email, role, can_write, claude_daily_limit)
VALUES ('hoon@snuecse.org', 'admin', true, 100);

-- 2. Insert regular users
INSERT INTO user_permissions (email, role, can_write, claude_daily_limit)
VALUES 
  ('hoon@iw.es.kr', 'user', false, 10),
  ('sociogram@gmail.com', 'user', false, 10);

-- 3. View all users
SELECT * FROM user_permissions ORDER BY role DESC, email;