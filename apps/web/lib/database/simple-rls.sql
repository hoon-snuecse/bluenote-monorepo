-- Simple RLS policies for development
-- These policies allow all operations without authentication checks

-- First, drop existing policies
DROP POLICY IF EXISTS "Teachers can view all assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can create assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can update assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can delete assignments" ON assignments;

DROP POLICY IF EXISTS "Anyone can create submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions" ON submissions;

DROP POLICY IF EXISTS "Teachers can view all evaluations" ON evaluations;
DROP POLICY IF EXISTS "Teachers can create evaluations" ON evaluations;
DROP POLICY IF EXISTS "Teachers can update evaluations" ON evaluations;

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for assignments
CREATE POLICY "Allow all operations on assignments" ON assignments
  FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for submissions
CREATE POLICY "Allow all operations on submissions" ON submissions
  FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for evaluations
CREATE POLICY "Allow all operations on evaluations" ON evaluations
  FOR ALL USING (true) WITH CHECK (true);