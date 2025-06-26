-- Role Name Migration
-- Changes:
-- 1. "admin" -> "creator"
-- 2. "instructor" -> "admin"
-- 3. "instructor_id" -> "creator_id" in courses table

-- Step 1: Update the check constraint on the profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role in ('creator', 'admin', 'student'));

-- Step 2: Update existing data in profiles table
UPDATE profiles SET role = 'creator' WHERE role = 'admin';
UPDATE profiles SET role = 'admin' WHERE role = 'instructor';

-- Step 3: Rename instructor_id to creator_id in courses table
ALTER TABLE courses RENAME COLUMN instructor_id TO creator_id;

-- Step 4: Update all RLS policies that reference these roles
-- First, drop all existing policies that reference the old role names

-- PROFILES POLICIES
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;

-- CATEGORIES POLICIES
drop policy if exists "Only admins can manage categories" on categories;

-- COURSES POLICIES
drop policy if exists "Instructors can create courses" on courses;
drop policy if exists "Instructors can update own courses" on courses;
drop policy if exists "Admins can manage all courses" on courses;

-- LESSONS POLICIES
drop policy if exists "Instructors can manage own course lessons" on lessons;
drop policy if exists "Admins can manage all lessons" on lessons;

-- ENROLLMENTS POLICIES
drop policy if exists "Instructors can view course enrollments" on enrollments;
drop policy if exists "Admins can view all enrollments" on enrollments;

-- PROGRESS POLICIES
drop policy if exists "Instructors can view course progress" on progress;
drop policy if exists "Admins can view all progress" on progress;

-- PURCHASES POLICIES
drop policy if exists "Admins can view all purchases" on purchases;

-- REVIEWS POLICIES
drop policy if exists "Admins can manage all reviews" on reviews;

-- CONTACT MESSAGES POLICIES
drop policy if exists "Only admins can view contact messages" on contact_messages;
drop policy if exists "Only admins can update contact messages" on contact_messages;

-- NEWSLETTER SUBSCRIPTIONS POLICIES
drop policy if exists "Only admins can view all subscriptions" on newsletter_subscriptions;

-- Step 5: Create new policies with updated role names

-- PROFILES POLICIES
create policy "Admins can view all profiles" on profiles
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

create policy "Admins can update all profiles" on profiles
  for update using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

create policy "Creators can view own profile" on profiles
  for select using (auth.uid() = id);

-- CATEGORIES POLICIES
create policy "Only admins can manage categories" on categories
  for all using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- COURSES POLICIES
create policy "Creators and admins can create courses" on courses
  for insert with check (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' in ('admin', 'creator')
  );

create policy "Creators can update own courses" on courses
  for update using (creator_id = auth.uid());

create policy "Admins can manage all courses" on courses
  for all using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- LESSONS POLICIES
create policy "Creators can manage own course lessons" on lessons
  for all using (
    exists (
      select 1 from courses
      where id = lessons.course_id and creator_id = auth.uid()
    )
  );

create policy "Admins can manage all lessons" on lessons
  for all using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ENROLLMENTS POLICIES
create policy "Creators can view course enrollments" on enrollments
  for select using (
    exists (
      select 1 from courses
      where id = enrollments.course_id and creator_id = auth.uid()
    )
  );

create policy "Admins can view all enrollments" on enrollments
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- PROGRESS POLICIES
create policy "Creators can view course progress" on progress
  for select using (
    exists (
      select 1 from courses
      where id = progress.course_id and creator_id = auth.uid()
    )
  );

create policy "Admins can view all progress" on progress
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- PURCHASES POLICIES
create policy "Admins can view all purchases" on purchases
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

create policy "Creators can view course purchases" on purchases
  for select using (
    exists (
      select 1 from courses
      where id = purchases.course_id and creator_id = auth.uid()
    )
  );

-- REVIEWS POLICIES
create policy "Admins can manage all reviews" on reviews
  for all using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

create policy "Creators can view course reviews" on reviews
  for select using (
    exists (
      select 1 from courses
      where id = reviews.course_id and creator_id = auth.uid()
    )
  );

-- CONTACT MESSAGES POLICIES
create policy "Only admins can view contact messages" on contact_messages
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

create policy "Only admins can update contact messages" on contact_messages
  for update using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- NEWSLETTER SUBSCRIPTIONS POLICIES
create policy "Only admins can view all subscriptions" on newsletter_subscriptions
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Verify the changes
select 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd, 
  qual, 
  with_check
from pg_policies
where schemaname = 'public' and 
      policyname like '%creator%' or policyname like '%admin%'; 