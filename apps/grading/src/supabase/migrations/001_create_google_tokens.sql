-- Create google_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS google_tokens (
  user_email TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_tokens_user_email ON google_tokens(user_email);

-- Grant permissions
GRANT ALL ON google_tokens TO authenticated;
GRANT ALL ON google_tokens TO service_role;
GRANT ALL ON google_tokens TO anon;

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_google_tokens_updated_at ON google_tokens;
CREATE TRIGGER update_google_tokens_updated_at 
  BEFORE UPDATE ON google_tokens 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();