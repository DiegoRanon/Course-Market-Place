-- REMOVE_COURSE_STATUS_FIELD.sql
-- Script to remove the status field from courses table and update related RLS policies

-- Step 1: Identify and drop RLS policies that use the status field
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;

-- Step 1.1: Drop the dependent policy on profiles table that references courses.status
DROP POLICY IF EXISTS "Anyone can view creator profiles of published courses" ON profiles;

-- Step 1.2: Drop indexes that reference the status field
DROP INDEX IF EXISTS courses_status_idx;
DROP INDEX IF EXISTS idx_courses_status_featured;
DROP INDEX IF EXISTS idx_courses_category_status;
DROP INDEX IF EXISTS idx_courses_instructor_status;

-- Step 1.3: Drop or recreate views that reference the status field
DROP VIEW IF EXISTS vw_course_listings;
DROP VIEW IF EXISTS vw_course_details;
DROP MATERIALIZED VIEW IF EXISTS mv_featured_courses;

-- Step 2: Create new RLS policies that don't depend on the status field
-- Now all courses will be visible to anyone (public)
CREATE POLICY "Anyone can view all courses" ON courses
  FOR SELECT USING (true);

-- Step 2.1: Create a replacement policy for profiles that doesn't depend on courses.status
CREATE POLICY "Anyone can view creator profiles" ON profiles
  FOR SELECT USING (true);

-- Step 2.2: Create replacement indexes if needed
-- For example, if you still need an index on featured:
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_creator ON courses(creator_id);

-- Step 3: Remove the status field from the courses table with CASCADE option
-- This will force the removal of any dependent objects
ALTER TABLE courses DROP COLUMN IF EXISTS status CASCADE;

-- Step 4: Recreate views without the status field
-- Recreate course listings view without status filter
CREATE OR REPLACE VIEW vw_course_listings AS
SELECT 
  c.id,
  c.title,
  c.slug,
  c.description,
  c.thumbnail_url,
  c.price,
  c.featured,
  c.rating,
  c.total_students,
  c.total_lessons,
  c.created_at,
  c.updated_at,
  cat.id as category_id,
  cat.name as category_name,
  p.id as creator_id,
  p.full_name as creator_name,
  p.avatar_url as creator_avatar
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN profiles p ON c.creator_id = p.id;

-- Step 5: Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'courses' AND column_name = 'status';

-- Step 6: List current policies to verify changes
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'courses'
ORDER BY policyname; 