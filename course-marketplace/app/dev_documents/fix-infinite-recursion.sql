-- Fix Infinite Recursion in RLS Policies
-- Run this in your Supabase SQL Editor

-- First, let's check if we have any problematic policies
SELECT tablename, policyname, definition 
FROM pg_policies 
WHERE tablename IN ('profiles', 'courses');

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create new profiles policies without infinite recursion
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" ON profiles
  FOR INSERT WITH CHECK (true);

-- Fixed JWT claims syntax for admin policies
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Ensure courses can be viewed by anyone when published
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (status = 'published');

-- Verify the policies were created correctly
SELECT tablename, policyname, definition 
FROM pg_policies 
WHERE tablename IN ('profiles', 'courses');

-- Enable RLS on the tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY; 