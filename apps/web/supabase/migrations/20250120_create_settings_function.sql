-- Create a stored function to update settings
CREATE OR REPLACE FUNCTION update_system_settings(
  p_site_name TEXT,
  p_site_description TEXT,
  p_admin_email TEXT,
  p_claude_enabled BOOLEAN,
  p_claude_default_daily_limit INTEGER,
  p_claude_system_prompt TEXT,
  p_claude_model TEXT,
  p_posts_per_page INTEGER,
  p_enable_comments BOOLEAN,
  p_enable_search BOOLEAN,
  p_default_categories JSONB,
  p_session_timeout INTEGER,
  p_max_login_attempts INTEGER,
  p_enable_ip_whitelist BOOLEAN,
  p_ip_whitelist JSONB,
  p_auto_backup BOOLEAN,
  p_backup_frequency TEXT,
  p_log_retention_days INTEGER,
  p_enable_maintenance_mode BOOLEAN,
  p_updated_by TEXT
) RETURNS VOID AS $$
BEGIN
  -- First try to update
  UPDATE system_settings
  SET 
    site_name = p_site_name,
    site_description = p_site_description,
    admin_email = p_admin_email,
    claude_enabled = p_claude_enabled,
    claude_default_daily_limit = p_claude_default_daily_limit,
    claude_system_prompt = p_claude_system_prompt,
    claude_model = p_claude_model,
    posts_per_page = p_posts_per_page,
    enable_comments = p_enable_comments,
    enable_search = p_enable_search,
    default_categories = p_default_categories,
    session_timeout = p_session_timeout,
    max_login_attempts = p_max_login_attempts,
    enable_ip_whitelist = p_enable_ip_whitelist,
    ip_whitelist = p_ip_whitelist,
    auto_backup = p_auto_backup,
    backup_frequency = p_backup_frequency,
    log_retention_days = p_log_retention_days,
    enable_maintenance_mode = p_enable_maintenance_mode,
    updated_at = NOW(),
    updated_by = p_updated_by
  WHERE id = 1;
  
  -- If no rows were updated, insert
  IF NOT FOUND THEN
    INSERT INTO system_settings (
      id, site_name, site_description, admin_email,
      claude_enabled, claude_default_daily_limit, claude_system_prompt, claude_model,
      posts_per_page, enable_comments, enable_search, default_categories,
      session_timeout, max_login_attempts, enable_ip_whitelist, ip_whitelist,
      auto_backup, backup_frequency, log_retention_days, enable_maintenance_mode,
      updated_by
    ) VALUES (
      1, p_site_name, p_site_description, p_admin_email,
      p_claude_enabled, p_claude_default_daily_limit, p_claude_system_prompt, p_claude_model,
      p_posts_per_page, p_enable_comments, p_enable_search, p_default_categories,
      p_session_timeout, p_max_login_attempts, p_enable_ip_whitelist, p_ip_whitelist,
      p_auto_backup, p_backup_frequency, p_log_retention_days, p_enable_maintenance_mode,
      p_updated_by
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_system_settings TO authenticated;
GRANT EXECUTE ON FUNCTION update_system_settings TO service_role;