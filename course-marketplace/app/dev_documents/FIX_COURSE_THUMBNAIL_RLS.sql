-- Fix RLS policy for course thumbnails
-- This SQL script addresses the row-level security policy violation when uploading course thumbnails

-- First, check existing policies on the courses table
SELECT * FROM pg_policies WHERE tablename = 'courses';

-- Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Courses can be created by admin or creator" ON "courses";

-- Create new policy that allows admins to create courses with thumbnails
CREATE POLICY "Courses can be created by admin or creator" ON "courses"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'))
  OR 
  (creator_id = (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'creator'))
);

-- Ensure admins can update courses
DROP POLICY IF EXISTS "Admins can update any course" ON "courses";
CREATE POLICY "Admins can update any course" ON "courses"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Ensure creators can update their own courses
DROP POLICY IF EXISTS "Creators can update their own courses" ON "courses";
CREATE POLICY "Creators can update their own courses" ON "courses"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (creator_id = (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'creator'))
WITH CHECK (creator_id = (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'creator'));

-- Ensure everyone can read published courses
DROP POLICY IF EXISTS "Everyone can read published courses" ON "courses";
CREATE POLICY "Everyone can read published courses" ON "courses"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (status = 'published');

-- Ensure admins can read all courses
DROP POLICY IF EXISTS "Admins can read all courses" ON "courses";
CREATE POLICY "Admins can read all courses" ON "courses"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Ensure creators can read their own courses
DROP POLICY IF EXISTS "Creators can read their own courses" ON "courses";
CREATE POLICY "Creators can read their own courses" ON "courses"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (creator_id = (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'creator'));

-- Add policy for storage bucket access for course thumbnails
DROP POLICY IF EXISTS "Allow authenticated users to upload course thumbnails" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload course thumbnails" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-thumbnails' AND
  auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin' OR role = 'creator')
);

-- Add policy for storage bucket access for reading course thumbnails
DROP POLICY IF EXISTS "Allow public access to course thumbnails" ON storage.objects;
CREATE POLICY "Allow public access to course thumbnails" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'course-thumbnails');

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'courses' OR tablename = 'objects'; 