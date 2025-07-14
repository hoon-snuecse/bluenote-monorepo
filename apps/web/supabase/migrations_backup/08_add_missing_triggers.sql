-- Add missing updated_at triggers for teaching and analytics tables

-- Create trigger for teaching_posts
CREATE TRIGGER update_teaching_posts_updated_at 
  BEFORE UPDATE ON teaching_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for analytics_posts  
CREATE TRIGGER update_analytics_posts_updated_at 
  BEFORE UPDATE ON analytics_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Note: These triggers use the secure version of update_updated_at_column() 
-- that was fixed in migration 07_fix_search_path_security.sql