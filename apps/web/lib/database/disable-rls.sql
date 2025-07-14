-- Disable RLS for development
-- WARNING: Only use this in development. Enable RLS with proper policies in production.

ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can view all assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can create assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can update assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can delete assignments" ON assignments;

DROP POLICY IF EXISTS "Anyone can create submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions" ON submissions;

DROP POLICY IF EXISTS "Teachers can view all evaluations" ON evaluations;
DROP POLICY IF EXISTS "Teachers can create evaluations" ON evaluations;
DROP POLICY IF EXISTS "Teachers can update evaluations" ON evaluations;