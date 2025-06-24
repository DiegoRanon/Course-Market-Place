# 🚀 Complete Supabase Setup Guide for Course Marketplace

This guide will walk you through setting up your Supabase database to work with the Course Marketplace application. Follow each step carefully to ensure all functionality works properly.

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- Basic knowledge of SQL
- Your project's environment variables ready

## 🎯 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `course-marketplace` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 2-3 minutes)

## 🔑 Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
3. Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🗄️ Step 3: Create Database Tables

Open the **SQL Editor** in your Supabase dashboard and run the following SQL commands in order:

### 3.1 Create Profiles Table

```sql
-- Create profiles table (extends Supabase Auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  full_name text,
  bio text,
  role text check (role in ('admin', 'instructor', 'student')) default 'student',
  status text check (status in ('active', 'inactive')) default 'active',
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create indexes for better performance
create index profiles_role_idx on profiles(role);
create index profiles_status_idx on profiles(status);
```

### 3.2 Create Categories Table

```sql
-- Create categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  color text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table categories enable row level security;

-- Create indexes
create index categories_slug_idx on categories(slug);
```

### 3.3 Create Courses Table

```sql
-- Create courses table
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  short_description text,
  thumbnail_url text,
  price numeric(10, 2) not null default 0,
  original_price numeric(10, 2),
  category_id uuid references categories(id),
  instructor_id uuid references profiles(id),
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')) default 'beginner',
  duration_hours integer default 0,
  total_lessons integer default 0,
  rating numeric(3, 2) default 0,
  total_ratings integer default 0,
  total_students integer default 0,
  featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table courses enable row level security;

-- Create indexes
create index courses_slug_idx on courses(slug);
create index courses_status_idx on courses(status);
create index courses_instructor_id_idx on courses(instructor_id);
create index courses_category_id_idx on courses(category_id);
create index courses_featured_idx on courses(featured);
```

### 3.4 Create Lessons Table

```sql
-- Create lessons table
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  video_duration integer, -- in seconds
  position integer not null, -- for ordering
  is_free boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table lessons enable row level security;

-- Create indexes
create index lessons_course_id_idx on lessons(course_id);
create index lessons_position_idx on lessons(position);
```

### 3.5 Create Enrollments Table

```sql
-- Create enrollments table
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  enrolled_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  progress_percentage numeric(5, 2) default 0,
  unique (user_id, course_id)
);

-- Enable Row Level Security
alter table enrollments enable row level security;

-- Create indexes
create index enrollments_user_id_idx on enrollments(user_id);
create index enrollments_course_id_idx on enrollments(course_id);
```

### 3.6 Create Progress Table

```sql
-- Create progress table
create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  completed boolean default false,
  watched_duration integer default 0, -- in seconds
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, lesson_id)
);

-- Enable Row Level Security
alter table progress enable row level security;

-- Create indexes
create index progress_user_id_idx on progress(user_id);
create index progress_lesson_id_idx on progress(lesson_id);
create index progress_course_id_idx on progress(course_id);
```

### 3.7 Create Purchases Table

```sql
-- Create purchases table
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  amount numeric(10, 2) not null,
  currency text default 'usd',
  status text check (status in ('pending', 'completed', 'failed', 'refunded')) default 'pending',
  purchased_at timestamp with time zone default now(),
  refunded_at timestamp with time zone
);

-- Enable Row Level Security
alter table purchases enable row level security;

-- Create indexes
create index purchases_user_id_idx on purchases(user_id);
create index purchases_course_id_idx on purchases(course_id);
create index purchases_status_idx on purchases(status);
```

### 3.8 Create Reviews Table

```sql
-- Create reviews table
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, course_id)
);

-- Enable Row Level Security
alter table reviews enable row level security;

-- Create indexes
create index reviews_course_id_idx on reviews(course_id);
create index reviews_user_id_idx on reviews(user_id);
create index reviews_rating_idx on reviews(rating);
```

### 3.9 Create Contact Messages Table

```sql
-- Create contact_messages table
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  newsletter_subscription boolean default false,
  status text check (status in ('new', 'read', 'replied', 'closed')) default 'new',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table contact_messages enable row level security;

-- Create indexes
create index contact_messages_status_idx on contact_messages(status);
create index contact_messages_email_idx on contact_messages(email);
```

### 3.10 Create Newsletter Subscriptions Table

```sql
-- Create newsletter_subscriptions table
create table newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  last_name text,
  subscribed_at timestamp with time zone default now(),
  unsubscribed_at timestamp with time zone,
  is_active boolean default true
);

-- Enable Row Level Security
alter table newsletter_subscriptions enable row level security;

-- Create indexes
create index newsletter_subscriptions_email_idx on newsletter_subscriptions(email);
create index newsletter_subscriptions_active_idx on newsletter_subscriptions(is_active);
```

## 🔒 Step 4: Set Up Row Level Security (RLS) Policies

### 4.1 Profiles Policies

```sql
-- Users can view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update all profiles
create policy "Admins can update all profiles" on profiles
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.2 Categories Policies

```sql
-- Anyone can view categories
create policy "Anyone can view categories" on categories
  for select using (true);

-- Only admins can insert/update/delete categories
create policy "Only admins can manage categories" on categories
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.3 Courses Policies

```sql
-- Anyone can view published courses
create policy "Anyone can view published courses" on courses
  for select using (status = 'published');

-- Users can view their own courses (draft/published)
create policy "Users can view own courses" on courses
  for select using (instructor_id = auth.uid());

-- Instructors can create courses
create policy "Instructors can create courses" on courses
  for insert with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('instructor', 'admin')
    )
  );

-- Instructors can update their own courses
create policy "Instructors can update own courses" on courses
  for update using (instructor_id = auth.uid());

-- Admins can manage all courses
create policy "Admins can manage all courses" on courses
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.4 Lessons Policies

```sql
-- Anyone can view lessons for published courses
create policy "Anyone can view lessons for published courses" on lessons
  for select using (
    exists (
      select 1 from courses
      where id = lessons.course_id and status = 'published'
    )
  );

-- Enrolled users can view lessons for their courses
create policy "Enrolled users can view lessons" on lessons
  for select using (
    exists (
      select 1 from enrollments
      where user_id = auth.uid() and course_id = lessons.course_id
    )
  );

-- Instructors can manage lessons for their courses
create policy "Instructors can manage own course lessons" on lessons
  for all using (
    exists (
      select 1 from courses
      where id = lessons.course_id and instructor_id = auth.uid()
    )
  );

-- Admins can manage all lessons
create policy "Admins can manage all lessons" on lessons
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.5 Enrollments Policies

```sql
-- Users can view their own enrollments
create policy "Users can view own enrollments" on enrollments
  for select using (user_id = auth.uid());

-- Users can enroll in courses
create policy "Users can enroll in courses" on enrollments
  for insert with check (user_id = auth.uid());

-- Users can update their own enrollments
create policy "Users can update own enrollments" on enrollments
  for update using (user_id = auth.uid());

-- Instructors can view enrollments for their courses
create policy "Instructors can view course enrollments" on enrollments
  for select using (
    exists (
      select 1 from courses
      where id = enrollments.course_id and instructor_id = auth.uid()
    )
  );

-- Admins can view all enrollments
create policy "Admins can view all enrollments" on enrollments
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.6 Progress Policies

```sql
-- Users can view their own progress
create policy "Users can view own progress" on progress
  for select using (user_id = auth.uid());

-- Users can update their own progress
create policy "Users can update own progress" on progress
  for insert with check (user_id = auth.uid());

create policy "Users can update own progress" on progress
  for update using (user_id = auth.uid());

-- Instructors can view progress for their courses
create policy "Instructors can view course progress" on progress
  for select using (
    exists (
      select 1 from courses
      where id = progress.course_id and instructor_id = auth.uid()
    )
  );

-- Admins can view all progress
create policy "Admins can view all progress" on progress
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.7 Purchases Policies

```sql
-- Users can view their own purchases
create policy "Users can view own purchases" on purchases
  for select using (user_id = auth.uid());

-- Users can create purchases
create policy "Users can create purchases" on purchases
  for insert with check (user_id = auth.uid());

-- Admins can view all purchases
create policy "Admins can view all purchases" on purchases
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.8 Reviews Policies

```sql
-- Anyone can view reviews for published courses
create policy "Anyone can view reviews for published courses" on reviews
  for select using (
    exists (
      select 1 from courses
      where id = reviews.course_id and status = 'published'
    )
  );

-- Users can create reviews for courses they're enrolled in
create policy "Users can create reviews for enrolled courses" on reviews
  for insert with check (
    user_id = auth.uid() and
    exists (
      select 1 from enrollments
      where user_id = auth.uid() and course_id = reviews.course_id
    )
  );

-- Users can update their own reviews
create policy "Users can update own reviews" on reviews
  for update using (user_id = auth.uid());

-- Users can delete their own reviews
create policy "Users can delete own reviews" on reviews
  for delete using (user_id = auth.uid());

-- Admins can manage all reviews
create policy "Admins can manage all reviews" on reviews
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.9 Contact Messages Policies

```sql
-- Anyone can create contact messages
create policy "Anyone can create contact messages" on contact_messages
  for insert with check (true);

-- Only admins can view contact messages
create policy "Only admins can view contact messages" on contact_messages
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can update contact messages
create policy "Only admins can update contact messages" on contact_messages
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 4.10 Newsletter Subscriptions Policies

```sql
-- Anyone can subscribe to newsletter
create policy "Anyone can subscribe to newsletter" on newsletter_subscriptions
  for insert with check (true);

-- Users can unsubscribe themselves
create policy "Users can unsubscribe themselves" on newsletter_subscriptions
  for update using (email = auth.jwt() ->> 'email');

-- Only admins can view all subscriptions
create policy "Only admins can view all subscriptions" on newsletter_subscriptions
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

## 🔧 Step 5: Create Database Functions

### 5.1 Function to Update Course Statistics

```sql
-- Function to update course rating and total ratings
create or replace function update_course_rating()
returns trigger as $$
begin
  -- Update course rating and total ratings
  update courses
  set
    rating = (
      select coalesce(avg(rating), 0)
      from reviews
      where course_id = new.course_id
    ),
    total_ratings = (
      select count(*)
      from reviews
      where course_id = new.course_id
    )
  where id = new.course_id;

  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update course rating when review is added/updated/deleted
create trigger update_course_rating_trigger
  after insert or update or delete on reviews
  for each row
  execute function update_course_rating();
```

### 5.2 Function to Update Course Progress

```sql
-- Function to update enrollment progress percentage
create or replace function update_enrollment_progress()
returns trigger as $$
declare
  total_lessons integer;
  completed_lessons integer;
  progress_percentage numeric(5, 2);
begin
  -- Get total lessons for the course
  select count(*) into total_lessons
  from lessons
  where course_id = new.course_id;

  -- Get completed lessons for the user
  select count(*) into completed_lessons
  from progress
  where user_id = new.user_id
    and course_id = new.course_id
    and completed = true;

  -- Calculate progress percentage
  if total_lessons > 0 then
    progress_percentage := (completed_lessons::numeric / total_lessons::numeric) * 100;
  else
    progress_percentage := 0;
  end if;

  -- Update enrollment progress
  update enrollments
  set progress_percentage = progress_percentage
  where user_id = new.user_id and course_id = new.course_id;

  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update enrollment progress
create trigger update_enrollment_progress_trigger
  after insert or update on progress
  for each row
  execute function update_enrollment_progress();
```

### 5.3 Function to Update Course Student Count

```sql
-- Function to update course total students count
create or replace function update_course_students()
returns trigger as $$
begin
  -- Update total students count
  update courses
  set total_students = (
    select count(*)
    from enrollments
    where course_id = new.course_id
  )
  where id = new.course_id;

  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update course student count
create trigger update_course_students_trigger
  after insert or delete on enrollments
  for each row
  execute function update_course_students();
```

### 5.4 Function to Update Updated At Timestamp

```sql
-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at columns
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_courses_updated_at
  before update on courses
  for each row
  execute function update_updated_at_column();

create trigger update_lessons_updated_at
  before update on lessons
  for each row
  execute function update_updated_at_column();

create trigger update_progress_updated_at
  before update on progress
  for each row
  execute function update_updated_at_column();

create trigger update_reviews_updated_at
  before update on reviews
  for each row
  execute function update_updated_at_column();
```

## 👤 Step 6: Set Up Authentication Triggers

### 6.1 Function to Create Profile on Sign Up

```sql
-- Function to automatically create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 📊 Step 7: Insert Sample Data

### 7.1 Insert Sample Categories

```sql
-- Insert sample categories
insert into categories (name, slug, description, color) values
('Programming', 'programming', 'Learn to code with various programming languages', '#3B82F6'),
('Design', 'design', 'Master UI/UX design and creative skills', '#10B981'),
('Business', 'business', 'Develop business and entrepreneurship skills', '#F59E0B'),
('Marketing', 'marketing', 'Learn digital marketing and growth strategies', '#EF4444'),
('Data Science', 'data-science', 'Master data analysis and machine learning', '#8B5CF6'),
('Personal Development', 'personal-development', 'Improve yourself and your life skills', '#06B6D4');
```

### 7.2 Insert Sample Admin User

```sql
-- First, create a user through your application or Supabase Auth
-- Then update their role to admin (replace 'user-email@example.com' with actual email)
update profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'user-email@example.com'
);
```

## ⚙️ Step 8: Configure Email Settings

1. Go to **Settings** → **Auth** in your Supabase dashboard
2. Configure email templates:
   - **Confirm signup**: Customize the email confirmation template
   - **Invite user**: Customize the user invitation template
   - **Reset password**: Customize the password reset template
3. Set up email provider (if not using default):
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Configure your SMTP provider (SendGrid, Mailgun, etc.)

## 🔐 Step 9: Configure Storage (Optional)

If you plan to upload course images and videos:

1. Go to **Storage** in your Supabase dashboard
2. Create buckets:
   - `course-thumbnails` (for course images)
   - `course-videos` (for video content)
   - `user-avatars` (for profile pictures)
3. Set up storage policies:

```sql
-- Allow public access to course thumbnails
create policy "Public access to course thumbnails" on storage.objects
  for select using (bucket_id = 'course-thumbnails');

-- Allow authenticated users to upload avatars
create policy "Users can upload avatars" on storage.objects
  for insert with check (
    bucket_id = 'user-avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatars
create policy "Users can update own avatars" on storage.objects
  for update using (
    bucket_id = 'user-avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 🧪 Step 10: Test Your Setup

1. **Test Authentication**:

   - Try signing up a new user
   - Verify the profile is created automatically
   - Test email confirmation

2. **Test Database Operations**:

   - Create a course as an instructor
   - Enroll a student in a course
   - Add a review
   - Check that triggers work (ratings, progress, etc.)

3. **Test RLS Policies**:
   - Verify users can only see their own data
   - Verify admins can see all data
   - Verify instructors can manage their courses

## 🚨 Troubleshooting

### Common Issues:

1. **RLS Policy Errors**: Make sure all policies are created correctly
2. **Trigger Errors**: Check that functions are created before triggers
3. **Foreign Key Errors**: Ensure referenced tables exist before creating relationships
4. **Permission Errors**: Verify user roles are set correctly

### Debug Commands:

```sql
-- Check if RLS is enabled
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public';

-- Check policies
select * from pg_policies
where schemaname = 'public';

-- Check triggers
select * from pg_trigger
where tgrelid in (
  select oid from pg_class
  where relnamespace = (select oid from pg_namespace where nspname = 'public')
);
```

## 🎉 You're Done!

Your Supabase database is now fully configured and ready to work with your Course Marketplace application. All tables, relationships, security policies, and triggers are in place.

### Next Steps:

1. Start your Next.js application
2. Test all functionality
3. Add more sample data as needed
4. Customize email templates
5. Set up monitoring and analytics

### Important Notes:

- **Backup your database** regularly
- **Monitor your usage** to stay within free tier limits
- **Keep your API keys secure** and never commit them to version control
- **Test thoroughly** before deploying to production

If you encounter any issues, check the Supabase documentation or community forums for help!
