-- IMPLEMENT_RLS_POLICIES.sql
-- Implements comprehensive Row Level Security (RLS) policies for the Course Marketplace

-- Enable RLS on all tables if not already enabled
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is creator
CREATE OR REPLACE FUNCTION is_creator()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'creator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is enrolled in a course
CREATE OR REPLACE FUNCTION is_enrolled(course_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM enrollments
    WHERE user_id = auth.uid() 
      AND course_id = $1
      AND status IN ('active', 'completed')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is creator of a course
CREATE OR REPLACE FUNCTION is_course_creator(course_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM courses
    WHERE id = $1 AND creator_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Consolidated RLS policies for profiles table
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Read policy: Users can read their own profile, admins can read all profiles
CREATE POLICY "profiles_read_policy" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR is_admin()
  );

-- Insert policy: Users can create their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

-- Update policy: Users can update their own profile, admins can update any profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR is_admin()
  );

-- Delete policy: Only admins can delete profiles
CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE USING (
    is_admin()
  );

-- Consolidated RLS policies for categories table
DROP POLICY IF EXISTS "categories_read_policy" ON categories;
DROP POLICY IF EXISTS "categories_write_policy" ON categories;

-- Read policy: Anyone can read categories
CREATE POLICY "categories_read_policy" ON categories
  FOR SELECT USING (true);

-- Write policy: Only admins can modify categories
CREATE POLICY "categories_write_policy" ON categories
  FOR ALL USING (
    is_admin()
  );

-- Consolidated RLS policies for courses table
DROP POLICY IF EXISTS "courses_read_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_policy" ON courses;
DROP POLICY IF EXISTS "courses_update_policy" ON courses;
DROP POLICY IF EXISTS "courses_delete_policy" ON courses;

-- Read policy: Anyone can read published courses, creators can read their own courses
CREATE POLICY "courses_read_policy" ON courses
  FOR SELECT USING (
    status = 'published' OR 
    creator_id = auth.uid() OR 
    is_admin()
  );

-- Insert policy: Creators and admins can create courses
CREATE POLICY "courses_insert_policy" ON courses
  FOR INSERT WITH CHECK (
    is_creator() OR is_admin()
  );

-- Update policy: Creators can update their own courses, admins can update any course
CREATE POLICY "courses_update_policy" ON courses
  FOR UPDATE USING (
    creator_id = auth.uid() OR is_admin()
  );

-- Delete policy: Creators can delete their own courses, admins can delete any course
CREATE POLICY "courses_delete_policy" ON courses
  FOR DELETE USING (
    creator_id = auth.uid() OR is_admin()
  );

-- Consolidated RLS policies for sections table
DROP POLICY IF EXISTS "sections_read_policy" ON sections;
DROP POLICY IF EXISTS "sections_write_policy" ON sections;

-- Read policy: Anyone can read sections of published courses, or if they're enrolled
CREATE POLICY "sections_read_policy" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = sections.course_id AND (
        status = 'published' OR
        creator_id = auth.uid() OR
        is_admin() OR
        is_enrolled(id)
      )
    )
  );

-- Write policy: Creators can modify sections of their own courses, admins can modify any
CREATE POLICY "sections_write_policy" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = sections.course_id AND (
        creator_id = auth.uid() OR is_admin()
      )
    )
  );

-- Consolidated RLS policies for lessons table
DROP POLICY IF EXISTS "lessons_read_policy" ON lessons;
DROP POLICY IF EXISTS "lessons_write_policy" ON lessons;

-- Read policy: Anyone can read lessons of published courses, or if they're enrolled
CREATE POLICY "lessons_read_policy" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON sections.course_id = courses.id
      WHERE sections.id = lessons.section_id AND (
        courses.status = 'published' OR
        courses.creator_id = auth.uid() OR
        is_admin() OR
        is_enrolled(courses.id)
      )
    )
  );

-- Write policy: Creators can modify lessons of their own courses, admins can modify any
CREATE POLICY "lessons_write_policy" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON sections.course_id = courses.id
      WHERE sections.id = lessons.section_id AND (
        courses.creator_id = auth.uid() OR is_admin()
      )
    )
  );

-- Consolidated RLS policies for enrollments table
DROP POLICY IF EXISTS "enrollments_read_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_delete_policy" ON enrollments;

-- Read policy: Users can read their own enrollments, creators can read enrollments for their courses
CREATE POLICY "enrollments_read_policy" ON enrollments
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_course_creator(course_id) OR
    is_admin()
  );

-- Insert policy: Users can enroll themselves, admins can enroll anyone
CREATE POLICY "enrollments_insert_policy" ON enrollments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR is_admin()
  );

-- Update policy: Users can update their own enrollments, creators can update enrollments for their courses
CREATE POLICY "enrollments_update_policy" ON enrollments
  FOR UPDATE USING (
    user_id = auth.uid() OR
    is_course_creator(course_id) OR
    is_admin()
  );

-- Delete policy: Only admins can delete enrollments
CREATE POLICY "enrollments_delete_policy" ON enrollments
  FOR DELETE USING (
    is_admin()
  );

-- Consolidated RLS policies for progress table
DROP POLICY IF EXISTS "progress_read_policy" ON progress;
DROP POLICY IF EXISTS "progress_insert_policy" ON progress;
DROP POLICY IF EXISTS "progress_update_policy" ON progress;
DROP POLICY IF EXISTS "progress_delete_policy" ON progress;

-- Read policy: Users can read their own progress, creators can read progress for their courses
CREATE POLICY "progress_read_policy" ON progress
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM lessons
      JOIN sections ON lessons.section_id = sections.id
      JOIN courses ON sections.course_id = courses.id
      WHERE lessons.id = progress.lesson_id AND (
        courses.creator_id = auth.uid() OR is_admin()
      )
    )
  );

-- Insert policy: Users can insert their own progress
CREATE POLICY "progress_insert_policy" ON progress
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Update policy: Users can update their own progress
CREATE POLICY "progress_update_policy" ON progress
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Delete policy: Users can delete their own progress, admins can delete any
CREATE POLICY "progress_delete_policy" ON progress
  FOR DELETE USING (
    user_id = auth.uid() OR is_admin()
  );

-- Consolidated RLS policies for reviews table
DROP POLICY IF EXISTS "reviews_read_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON reviews;

-- Read policy: Anyone can read published reviews, users can read their own reviews
CREATE POLICY "reviews_read_policy" ON reviews
  FOR SELECT USING (
    is_published = true OR
    user_id = auth.uid() OR
    is_course_creator(course_id) OR
    is_admin()
  );

-- Insert policy: Enrolled users can create reviews for courses they're enrolled in
CREATE POLICY "reviews_insert_policy" ON reviews
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    is_enrolled(course_id)
  );

-- Update policy: Users can update their own reviews, admins can update any
CREATE POLICY "reviews_update_policy" ON reviews
  FOR UPDATE USING (
    user_id = auth.uid() OR is_admin()
  );

-- Delete policy: Users can delete their own reviews, admins can delete any
CREATE POLICY "reviews_delete_policy" ON reviews
  FOR DELETE USING (
    user_id = auth.uid() OR is_admin()
  );

-- Create a function to check if a user has access to a specific lesson
CREATE OR REPLACE FUNCTION can_access_lesson(lesson_id uuid)
RETURNS boolean AS $$
DECLARE
  course_id uuid;
  is_free boolean;
BEGIN
  -- Get course ID and free status for this lesson
  SELECT 
    c.id, l.is_free INTO course_id, is_free
  FROM lessons l
  JOIN sections s ON l.section_id = s.id
  JOIN courses c ON s.course_id = c.id
  WHERE l.id = $1;
  
  -- Check access conditions
  RETURN (
    -- Free lessons are accessible to everyone
    is_free = true OR
    -- Enrolled users have access
    is_enrolled(course_id) OR
    -- Course creators have access
    is_course_creator(course_id) OR
    -- Admins have access to everything
    is_admin()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 