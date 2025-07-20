-- Add missing studentDbId column to Submission table
ALTER TABLE "Submission" 
ADD COLUMN IF NOT EXISTS "studentDbId" TEXT;

-- Add index for studentDbId
CREATE INDEX IF NOT EXISTS "Submission_studentDbId_idx" ON "Submission"("studentDbId");

-- Add missing studentDbId column to Evaluation table
ALTER TABLE "Evaluation" 
ADD COLUMN IF NOT EXISTS "studentDbId" TEXT;

-- Add index for studentDbId
CREATE INDEX IF NOT EXISTS "Evaluation_studentDbId_idx" ON "Evaluation"("studentDbId");

-- Create google_tokens table if not exists (already created in previous migration)
-- Just verify it exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'google_tokens'
) as table_exists;