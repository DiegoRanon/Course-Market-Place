-- Fix RLS policy for course videos
-- This SQL script addresses the row-level security policy violation when uploading course videos

-- First, check existing policies on the courses table
SELECT * FROM pg_policies WHERE tablename = 'courses';

-- Check existing policies on the storage.objects table for course-videos bucket
SELECT * FROM pg_policies WHERE tablename = 'objects' AND qual LIKE '%course-videos%';

-- Create policy for course-videos bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-videos', 'course-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policy for course videos if it exists
DROP POLICY IF EXISTS "Allow authenticated users to upload course videos" ON storage.objects;

-- Create policy to allow authenticated users to upload course videos
CREATE POLICY "Allow authenticated users to upload course videos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-videos' AND
  auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin' OR role = 'creator')
);

-- Create policy to allow authenticated users to read course videos
DROP POLICY IF EXISTS "Allow public access to course videos" ON storage.objects;
CREATE POLICY "Allow public access to course videos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'course-videos');

-- Ensure the courses table has the proper RLS policies for video_url
-- This should already be covered by the general course policies, but let's verify

-- Ensure admins can create courses with videos
DROP POLICY IF EXISTS "Courses with videos can be created by admin" ON "courses";
CREATE POLICY "Courses with videos can be created by admin" ON "courses"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
);

-- Ensure creators can create their own courses with videos
DROP POLICY IF EXISTS "Creators can create their own courses with videos" ON "courses";
CREATE POLICY "Creators can create their own courses with videos" ON "courses"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  creator_id = (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'creator')
);

-- Ensure admins can update courses with videos
DROP POLICY IF EXISTS "Admins can update any course with videos" ON "courses";
CREATE POLICY "Admins can update any course with videos" ON "courses"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Ensure creators can update their own courses with videos
DROP POLICY IF EXISTS "Creators can update their own courses with videos" ON "courses";
CREATE POLICY "Creators can update their own courses with videos" ON "courses"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (creator_id = (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'creator'))
WITH CHECK (creator_id = (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'creator'));

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'courses' OR (tablename = 'objects' AND qual LIKE '%course-videos%'); 