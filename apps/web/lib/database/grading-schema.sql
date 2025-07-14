-- Grading System Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  school_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  writing_type TEXT NOT NULL,
  evaluation_domains JSONB NOT NULL,
  evaluation_levels JSONB NOT NULL,
  level_count TEXT NOT NULL,
  grading_criteria TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'submitted', -- submitted, evaluated
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  scores JSONB NOT NULL, -- {clarity: 90, evidence: 85, ...}
  overall_score INTEGER NOT NULL,
  level TEXT NOT NULL, -- 매우 우수, 우수, 보통, 미흡
  feedback JSONB NOT NULL, -- {overall: "", strengths: [], improvements: []}
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  evaluated_by UUID REFERENCES auth.users(id)
);

-- Indexes for better performance
CREATE INDEX idx_assignments_created_by ON assignments(created_by);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_evaluations_assignment_id ON evaluations(assignment_id);
CREATE INDEX idx_evaluations_submission_id ON evaluations(submission_id);

-- Row Level Security (RLS) Policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Assignments policies
-- Teachers can view all assignments
CREATE POLICY "Teachers can view all assignments" ON assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Teachers can create assignments
CREATE POLICY "Teachers can create assignments" ON assignments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Teachers can update their own assignments
CREATE POLICY "Teachers can update own assignments" ON assignments
  FOR UPDATE USING (auth.uid() = created_by);

-- Teachers can delete their own assignments
CREATE POLICY "Teachers can delete own assignments" ON assignments
  FOR DELETE USING (auth.uid() = created_by);

-- Submissions policies
-- Anyone can create submissions (no auth required for students)
CREATE POLICY "Anyone can create submissions" ON submissions
  FOR INSERT WITH CHECK (true);

-- Teachers can view all submissions
CREATE POLICY "Teachers can view all submissions" ON submissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Evaluations policies
-- Teachers can view all evaluations
CREATE POLICY "Teachers can view all evaluations" ON evaluations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Teachers can create evaluations
CREATE POLICY "Teachers can create evaluations" ON evaluations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Teachers can update evaluations
CREATE POLICY "Teachers can update evaluations" ON evaluations
  FOR UPDATE USING (auth.uid() IS NOT NULL);