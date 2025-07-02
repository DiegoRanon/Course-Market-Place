# Supabase SQL Editor Fix for Infinite Recursion

## Instructions

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the SQL below
5. Run the query

## SQL to Fix Infinite Recursion in Courses Table

```sql
-- Fix Infinite Recursion in Courses Table RLS Policies
-- Run this in your Supabase SQL Editor

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
```

## SQL to Fix Infinite Recursion in Profiles Table (if needed)

```sql
-- Fix RLS Policies for Profiles Table - Fix Infinite Recursion
-- Run this in your Supabase SQL Editor

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view creator profiles of published courses" ON profiles;

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

-- Add policy to allow public access to creator profiles for published courses
CREATE POLICY "Anyone can view creator profiles of published courses" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE creator_id = profiles.id AND status = 'published'
    )
  );

-- Verify the policies were created correctly
SELECT policyname, permissive, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## After Running the SQL

After running the SQL, you should:

1. Refresh your application
2. Test fetching published courses
3. Test viewing course details with creator information
4. Test course creation as a creator
5. Test course management as an admin

If you still encounter issues, you may need to:

1. Sign out and sign back in to refresh your JWT token
2. Clear your browser cache
3. Restart your development server
