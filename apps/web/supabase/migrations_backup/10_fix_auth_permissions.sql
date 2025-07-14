-- Fix authentication permissions issue
-- Allow anonymous access to check if email exists in user_permissions during sign-in

-- Drop existing policies that might be blocking
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can view all user permissions" ON user_permissions;
DROP POLICY IF EXISTS "Only admins can manage user permissions" ON user_permissions;

-- Create new policy that allows checking email existence during authentication
-- This allows the auth system to verify if a user is allowed to sign in
CREATE POLICY "Allow public read for auth checks" 
  ON user_permissions FOR SELECT 
  USING (true);  -- Allow all SELECT queries for authentication

-- Create policy for INSERT/UPDATE/DELETE operations (admin only)
CREATE POLICY "Only admins can modify user permissions" 
  ON user_permissions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update user permissions" 
  ON user_permissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete user permissions" 
  ON user_permissions FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- Ensure the initial admin user exists
INSERT INTO user_permissions (email, role, claude_daily_limit, can_write) 
VALUES ('hoon@snuecse.org', 'admin', 999999, true)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', claude_daily_limit = 999999, can_write = true;