-- Fix security vulnerability in trigger functions by setting explicit search path

-- Update the shed posts trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Set search path to empty to prevent SQL injection
  SET search_path = '';
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the research posts trigger function
CREATE OR REPLACE FUNCTION update_research_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Set search path to empty to ensure only explicitly schema-qualified objects are used
  SET search_path = '';
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: If you have similar functions for teaching and analytics tables, 
-- they should also be updated with the same pattern