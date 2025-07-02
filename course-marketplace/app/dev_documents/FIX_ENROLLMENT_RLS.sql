-- FIX_ENROLLMENT_RLS.sql
-- Script to fix Row Level Security (RLS) policies for enrollments table

-- First, make sure RLS is enabled
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON enrollments;
DROP POLICY IF EXISTS "Creators can view enrollments for their courses" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;

-- Create policy for users to view their own enrollments
CREATE POLICY "Users can view own enrollments" 
ON enrollments FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to create their own enrollments
CREATE POLICY "Users can create enrollments" 
ON enrollments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for course creators to view enrollments for their courses
CREATE POLICY "Creators can view enrollments for their courses" 
ON enrollments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id 
    AND courses.creator_id = auth.uid()
  )
);

-- Create policy for admins to manage all enrollments
CREATE POLICY "Admins can manage all enrollments" 
ON enrollments FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS enrollments_user_course_idx ON enrollments(user_id, course_id); 