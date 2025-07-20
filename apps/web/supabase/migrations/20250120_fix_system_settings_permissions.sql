-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON system_settings;

-- Recreate policies with proper permissions
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

CREATE POLICY "Admins can insert system settings" ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'admin'
    )
  );

-- Service role bypass (for debugging)
CREATE POLICY "Service role bypass" ON system_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure default row exists
INSERT INTO system_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;