-- FIX_COURSES_INFINITE_RECURSION.sql
-- Fixes the infinite recursion detected in RLS policy for the courses table

-- First, let's check the existing policies on the courses table
SELECT policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'courses';

-- Drop all existing policies on the courses table to start fresh
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Creators can view their own courses" ON courses;
DROP POLICY IF EXISTS "Creators can create courses" ON courses;
DROP POLICY IF EXISTS "Creators can update own courses" ON courses;
DROP POLICY IF EXISTS "Admins have full access to courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Users can view own courses" ON courses;
DROP POLICY IF EXISTS "Creators can create courses" ON courses;
DROP POLICY IF EXISTS "Creators can update own courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;

-- Create new policies without circular references
-- 1. Allow anyone to view published courses
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (status = 'published');

-- 2. Allow creators to view their own courses
CREATE POLICY "Creators can view own courses" ON courses
  FOR SELECT USING (creator_id = auth.uid());

-- 3. Allow creators to create courses - using JWT claims instead of querying profiles
CREATE POLICY "Creators can create courses" ON courses
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('creator', 'admin')
  );

-- 4. Allow creators to update their own courses
CREATE POLICY "Creators can update own courses" ON courses
  FOR UPDATE USING (creator_id = auth.uid());

-- 5. Allow creators to delete their own courses
CREATE POLICY "Creators can delete own courses" ON courses
  FOR DELETE USING (creator_id = auth.uid());

-- 6. Allow admins to manage all courses - using JWT claims
CREATE POLICY "Admins can manage all courses" ON courses
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Verify the policies were created correctly
SELECT policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'courses';

-- Make sure RLS is enabled
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Verify there are no circular references by testing a query
SELECT id, title FROM courses WHERE status = 'published' LIMIT 1; 