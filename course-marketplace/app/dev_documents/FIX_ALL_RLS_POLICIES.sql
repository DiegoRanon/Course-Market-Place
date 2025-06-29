-- Fix All RLS Policies - Remove Infinite Recursion
-- Run this in your Supabase SQL Editor to fix all circular references

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Drop existing profiles policies
drop policy if exists "Users can create own profile" on profiles;
drop policy if exists "Allow profile creation during signup" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;

-- Create new profiles policies without infinite recursion
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can create own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Allow profile creation during signup" on profiles
  for insert with check (true);

create policy "Admins can view all profiles" on profiles
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

create policy "Admins can update all profiles" on profiles
  for update using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- CATEGORIES TABLE POLICIES
-- ============================================================================

-- Drop existing categories policies
drop policy if exists "Anyone can view categories" on categories;
drop policy if exists "Only admins can manage categories" on categories;

-- Create new categories policies
create policy "Anyone can view categories" on categories
  for select using (true);

create policy "Only admins can manage categories" on categories
  for all using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- COURSES TABLE POLICIES
-- ============================================================================

-- Drop existing courses policies
drop policy if exists "Anyone can view published courses" on courses;
drop policy if exists "Users can view own courses" on courses;
drop policy if exists "Creators can create courses" on courses;
drop policy if exists "Creators can update own courses" on courses;
drop policy if exists "Admins can manage all courses" on courses;

-- Create new courses policies
create policy "Anyone can view published courses" on courses
  for select using (status = 'published');

create policy "Users can view own courses" on courses
  for select using (creator_id = auth.uid());

create policy "Creators can create courses" on courses
  for insert with check (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' in ('creator', 'admin')
  );

create policy "Creators can update own courses" on courses
  for update using (creator_id = auth.uid());

create policy "Admins can manage all courses" on courses
  for all using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- LESSONS TABLE POLICIES
-- ============================================================================

-- Drop existing lessons policies
drop policy if exists "Anyone can view lessons for published courses" on lessons;
drop policy if exists "Enrolled users can view lessons" on lessons;
drop policy if exists "Creators can manage own course lessons" on lessons;
drop policy if exists "Admins can manage all lessons" on lessons;

-- Create new lessons policies
create policy "Anyone can view lessons for published courses" on lessons
  for select using (
    exists (
      select 1 from courses
      where id = lessons.course_id and status = 'published'
    )
  );

create policy "Enrolled users can view lessons" on lessons
  for select using (
    exists (
      select 1 from enrollments
      where user_id = auth.uid() and course_id = lessons.course_id
    )
  );

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

-- ============================================================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing enrollments policies
drop policy if exists "Users can view own enrollments" on enrollments;
drop policy if exists "Users can enroll in courses" on enrollments;
drop policy if exists "Users can update own enrollments" on enrollments;
drop policy if exists "Creators can view course enrollments" on enrollments;
drop policy if exists "Admins can view all enrollments" on enrollments;

-- Create new enrollments policies
create policy "Users can view own enrollments" on enrollments
  for select using (user_id = auth.uid());

create policy "Users can enroll in courses" on enrollments
  for insert with check (user_id = auth.uid());

create policy "Users can update own enrollments" on enrollments
  for update using (user_id = auth.uid());

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

-- ============================================================================
-- PROGRESS TABLE POLICIES
-- ============================================================================

-- Drop existing progress policies
drop policy if exists "Users can view own progress" on progress;
drop policy if exists "Users can update own progress" on progress;
drop policy if exists "Creators can view course progress" on progress;
drop policy if exists "Admins can view all progress" on progress;

-- Create new progress policies
create policy "Users can view own progress" on progress
  for select using (user_id = auth.uid());

create policy "Users can update own progress" on progress
  for insert with check (user_id = auth.uid());

create policy "Users can update own progress" on progress
  for update using (user_id = auth.uid());

create policy "Creators can view course progress" on progress
  for select using (
    exists (
      select 1 from lessons
      join sections on lessons.section_id = sections.id
      join courses on sections.course_id = courses.id
      where lessons.id = progress.lesson_id and courses.creator_id = auth.uid()
    )
  );

create policy "Admins can view all progress" on progress
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- PURCHASES TABLE POLICIES
-- ============================================================================

-- Drop existing purchases policies
drop policy if exists "Users can view own purchases" on purchases;
drop policy if exists "Users can create purchases" on purchases;
drop policy if exists "Admins can view all purchases" on purchases;

-- Create new purchases policies
create policy "Users can view own purchases" on purchases
  for select using (user_id = auth.uid());

create policy "Users can create purchases" on purchases
  for insert with check (user_id = auth.uid());

create policy "Admins can view all purchases" on purchases
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- REVIEWS TABLE POLICIES
-- ============================================================================

-- Drop existing reviews policies
drop policy if exists "Anyone can view reviews for published courses" on reviews;
drop policy if exists "Users can create reviews for enrolled courses" on reviews;
drop policy if exists "Users can update own reviews" on reviews;
drop policy if exists "Users can delete own reviews" on reviews;
drop policy if exists "Admins can manage all reviews" on reviews;

-- Create new reviews policies
create policy "Anyone can view reviews for published courses" on reviews
  for select using (
    exists (
      select 1 from courses
      where id = reviews.course_id and status = 'published'
    )
  );

create policy "Users can create reviews for enrolled courses" on reviews
  for insert with check (
    user_id = auth.uid() and
    exists (
      select 1 from enrollments
      where user_id = auth.uid() and course_id = reviews.course_id
    )
  );

create policy "Users can update own reviews" on reviews
  for update using (user_id = auth.uid());

create policy "Users can delete own reviews" on reviews
  for delete using (user_id = auth.uid());

create policy "Admins can manage all reviews" on reviews
  for all using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- CONTACT MESSAGES TABLE POLICIES
-- ============================================================================

-- Drop existing contact_messages policies
drop policy if exists "Anyone can create contact messages" on contact_messages;
drop policy if exists "Only admins can view contact messages" on contact_messages;
drop policy if exists "Only admins can update contact messages" on contact_messages;

-- Create new contact_messages policies
create policy "Anyone can create contact messages" on contact_messages
  for insert with check (true);

create policy "Only admins can view contact messages" on contact_messages
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

create policy "Only admins can update contact messages" on contact_messages
  for update using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- NEWSLETTER SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Drop existing newsletter_subscriptions policies
drop policy if exists "Anyone can subscribe to newsletter" on newsletter_subscriptions;
drop policy if exists "Users can unsubscribe themselves" on newsletter_subscriptions;
drop policy if exists "Only admins can view all subscriptions" on newsletter_subscriptions;

-- Create new newsletter_subscriptions policies
create policy "Anyone can subscribe to newsletter" on newsletter_subscriptions
  for insert with check (true);

create policy "Users can unsubscribe themselves" on newsletter_subscriptions
  for update using (email = auth.jwt() ->> 'email');

create policy "Only admins can view all subscriptions" on newsletter_subscriptions
  for select using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if all policies were created successfully
select 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd, 
  qual, 
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname; 