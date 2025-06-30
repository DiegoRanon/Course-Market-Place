-- IMPLEMENT_DATABASE_SCHEMA.sql
-- Combined SQL file for implementing the complete database schema for Course Marketplace
-- Execute sections in order to ensure proper table relationships

-- ========================================================================
-- SECTION 1: USER AND AUTHENTICATION TABLES
-- ========================================================================

-- Check if profiles table exists, create if it doesn't
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  full_name text,
  bio text,
  role text CHECK (role IN ('admin', 'creator', 'student')) DEFAULT 'student',
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ========================================================================
-- SECTION 2: COURSE AND CURRICULUM TABLES
-- ========================================================================

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  color text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);

-- Create courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  thumbnail_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  price numeric(10, 2) DEFAULT 0,
  discount_price numeric(10, 2),
  status text CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  featured boolean DEFAULT false,
  rating numeric(3, 2) DEFAULT 0,
  total_students integer DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  total_duration integer DEFAULT 0, -- in seconds
  level text CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all-levels')) DEFAULT 'all-levels',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS courses_slug_idx ON courses(slug);
CREATE INDEX IF NOT EXISTS courses_creator_idx ON courses(creator_id);
CREATE INDEX IF NOT EXISTS courses_category_idx ON courses(category_id);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status);
CREATE INDEX IF NOT EXISTS courses_featured_idx ON courses(featured);

-- Create trigger for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create sections table if it doesn't exist
CREATE TABLE IF NOT EXISTS sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (course_id, order_index)
);

-- Enable Row Level Security
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS sections_course_idx ON sections(course_id);
CREATE INDEX IF NOT EXISTS sections_order_idx ON sections(course_id, order_index);

-- Create trigger for updated_at
CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  section_id uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  video_url text,
  duration integer DEFAULT 0, -- in seconds
  is_free boolean DEFAULT false,
  is_preview boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (section_id, order_index)
);

-- Enable Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS lessons_section_idx ON lessons(section_id);
CREATE INDEX IF NOT EXISTS lessons_order_idx ON lessons(section_id, order_index);
CREATE INDEX IF NOT EXISTS lessons_free_idx ON lessons(is_free);
CREATE INDEX IF NOT EXISTS lessons_preview_idx ON lessons(is_preview);

-- Create trigger for updated_at
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to update course statistics
CREATE OR REPLACE FUNCTION update_course_lesson_stats()
RETURNS TRIGGER AS $$
DECLARE
  course_id uuid;
  total_lessons_count integer;
  total_duration_seconds integer;
BEGIN
  -- Get the course ID from the section
  SELECT sections.course_id INTO course_id
  FROM sections
  WHERE sections.id = NEW.section_id;
  
  -- Count total lessons for the course
  SELECT COUNT(*), SUM(COALESCE(duration, 0))
  INTO total_lessons_count, total_duration_seconds
  FROM lessons
  JOIN sections ON lessons.section_id = sections.id
  WHERE sections.course_id = course_id;
  
  -- Update the course statistics
  UPDATE courses
  SET 
    total_lessons = total_lessons_count,
    total_duration = total_duration_seconds,
    updated_at = now()
  WHERE id = course_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for lesson changes
CREATE TRIGGER on_lesson_inserted
AFTER INSERT ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_course_lesson_stats();

CREATE TRIGGER on_lesson_updated
AFTER UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_course_lesson_stats();

CREATE TRIGGER on_lesson_deleted
AFTER DELETE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_course_lesson_stats();

-- ========================================================================
-- SECTION 3: ENROLLMENT AND PROGRESS TRACKING TABLES
-- ========================================================================

-- Create enrollments table if it doesn't exist
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  purchased_at timestamp with time zone DEFAULT now(),
  amount_paid numeric(10, 2) DEFAULT 0,
  payment_id text, -- For Stripe payment reference
  status text CHECK (status IN ('active', 'completed', 'refunded', 'cancelled')) DEFAULT 'active',
  completion_percentage integer DEFAULT 0,
  last_accessed_at timestamp with time zone DEFAULT now(),
  certificate_issued boolean DEFAULT false,
  certificate_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS enrollments_user_idx ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_idx ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS enrollments_status_idx ON enrollments(status);
CREATE INDEX IF NOT EXISTS enrollments_purchased_idx ON enrollments(purchased_at);

-- Create trigger for updated_at
CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completion_percentage integer DEFAULT 0,
  last_position integer DEFAULT 0, -- Position in video in seconds
  notes text,
  last_accessed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS progress_user_idx ON progress(user_id);
CREATE INDEX IF NOT EXISTS progress_lesson_idx ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS progress_completed_idx ON progress(completed);
CREATE INDEX IF NOT EXISTS progress_last_accessed_idx ON progress(last_accessed_at);

-- Create trigger for updated_at
CREATE TRIGGER update_progress_updated_at
BEFORE UPDATE ON progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS reviews_user_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_course_idx ON reviews(course_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_published_idx ON reviews(is_published);

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to update course ratings
CREATE OR REPLACE FUNCTION update_course_ratings()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric(3, 2);
  total_reviews_count integer;
BEGIN
  -- Calculate average rating and count reviews
  SELECT AVG(rating)::numeric(3, 2), COUNT(*)
  INTO avg_rating, total_reviews_count
  FROM reviews
  WHERE course_id = NEW.course_id AND is_published = true;
  
  -- Update the course statistics
  UPDATE courses
  SET 
    rating = COALESCE(avg_rating, 0),
    total_reviews = total_reviews_count,
    updated_at = now()
  WHERE id = NEW.course_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for review changes
CREATE TRIGGER on_review_inserted
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_course_ratings();

CREATE TRIGGER on_review_updated
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_course_ratings();

CREATE TRIGGER on_review_deleted
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_course_ratings();

-- Create function to update enrollment counts
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
DECLARE
  total_students_count integer;
BEGIN
  -- Count total active enrollments for the course
  SELECT COUNT(*)
  INTO total_students_count
  FROM enrollments
  WHERE course_id = NEW.course_id AND status = 'active';
  
  -- Update the course statistics
  UPDATE courses
  SET 
    total_students = total_students_count,
    updated_at = now()
  WHERE id = NEW.course_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for enrollment changes
CREATE TRIGGER on_enrollment_inserted
AFTER INSERT ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_course_enrollment_count();

CREATE TRIGGER on_enrollment_updated
AFTER UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_course_enrollment_count();

CREATE TRIGGER on_enrollment_deleted
AFTER DELETE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_course_enrollment_count();

-- ========================================================================
-- SECTION 4: ROW LEVEL SECURITY POLICIES
-- ========================================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if user is creator
CREATE OR REPLACE FUNCTION is_creator()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'creator'
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if user is course creator
CREATE OR REPLACE FUNCTION is_course_creator(course_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM courses
    WHERE id = course_id AND creator_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if user is enrolled in course
CREATE OR REPLACE FUNCTION is_enrolled(course_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM enrollments
    WHERE course_id = course_id AND user_id = auth.uid() AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles
  USING (is_admin());

DROP POLICY IF EXISTS "Creators can view student profiles for their courses" ON profiles;
CREATE POLICY "Creators can view student profiles for their courses" ON profiles
  FOR SELECT USING (
    is_creator() AND EXISTS (
      SELECT 1 FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = profiles.id AND c.creator_id = auth.uid()
    )
  );

-- RLS Policies for categories table
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;
CREATE POLICY "Only admins can modify categories" ON categories
  USING (is_admin());

-- RLS Policies for courses table
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
CREATE POLICY "Published courses are viewable by everyone" ON courses
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Creators can view their own courses" ON courses;
CREATE POLICY "Creators can view their own courses" ON courses
  FOR SELECT USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can modify their own courses" ON courses;
CREATE POLICY "Creators can modify their own courses" ON courses
  FOR UPDATE USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can delete their own courses" ON courses;
CREATE POLICY "Creators can delete their own courses" ON courses
  FOR DELETE USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can insert courses" ON courses;
CREATE POLICY "Creators can insert courses" ON courses
  FOR INSERT WITH CHECK (is_creator() OR is_admin());

DROP POLICY IF EXISTS "Admins have full access to courses" ON courses;
CREATE POLICY "Admins have full access to courses" ON courses
  USING (is_admin());

-- RLS Policies for sections table
DROP POLICY IF EXISTS "Sections of published courses are viewable by everyone" ON sections;
CREATE POLICY "Sections of published courses are viewable by everyone" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id AND courses.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Course creators can view their course sections" ON sections;
CREATE POLICY "Course creators can view their course sections" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id AND courses.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Course creators can modify their course sections" ON sections;
CREATE POLICY "Course creators can modify their course sections" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id AND courses.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to sections" ON sections;
CREATE POLICY "Admins have full access to sections" ON sections
  USING (is_admin());

-- RLS Policies for lessons table
DROP POLICY IF EXISTS "Free/preview lessons of published courses are viewable by everyone" ON lessons;
CREATE POLICY "Free/preview lessons of published courses are viewable by everyone" ON lessons
  FOR SELECT USING (
    (is_free = true OR is_preview = true) AND EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON sections.course_id = courses.id
      WHERE sections.id = lessons.section_id AND courses.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Enrolled users can view all lessons of the course" ON lessons;
CREATE POLICY "Enrolled users can view all lessons of the course" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON sections.course_id = courses.id
      JOIN enrollments ON courses.id = enrollments.course_id
      WHERE sections.id = lessons.section_id 
        AND enrollments.user_id = auth.uid()
        AND enrollments.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Course creators can view their course lessons" ON lessons;
CREATE POLICY "Course creators can view their course lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON sections.course_id = courses.id
      WHERE sections.id = lessons.section_id AND courses.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Course creators can modify their course lessons" ON lessons;
CREATE POLICY "Course creators can modify their course lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON sections.course_id = courses.id
      WHERE sections.id = lessons.section_id AND courses.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to lessons" ON lessons;
CREATE POLICY "Admins have full access to lessons" ON lessons
  USING (is_admin());

-- RLS Policies for enrollments table
DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrollments;
CREATE POLICY "Users can view their own enrollments" ON enrollments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Course creators can view enrollments for their courses" ON enrollments;
CREATE POLICY "Course creators can view enrollments for their courses" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id AND courses.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to enrollments" ON enrollments;
CREATE POLICY "Admins have full access to enrollments" ON enrollments
  USING (is_admin());

-- RLS Policies for progress table
DROP POLICY IF EXISTS "Users can view and update their own progress" ON progress;
CREATE POLICY "Users can view and update their own progress" ON progress
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Course creators can view progress for their courses" ON progress;
CREATE POLICY "Course creators can view progress for their courses" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN sections ON lessons.section_id = sections.id
      JOIN courses ON sections.course_id = courses.id
      WHERE lessons.id = progress.lesson_id AND courses.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to progress" ON progress;
CREATE POLICY "Admins have full access to progress" ON progress
  USING (is_admin());

-- RLS Policies for reviews table
DROP POLICY IF EXISTS "Published reviews are viewable by everyone" ON reviews;
CREATE POLICY "Published reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Users can view and update their own reviews" ON reviews;
CREATE POLICY "Users can view and update their own reviews" ON reviews
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Course creators can view all reviews for their courses" ON reviews;
CREATE POLICY "Course creators can view all reviews for their courses" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = reviews.course_id AND courses.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to reviews" ON reviews;
CREATE POLICY "Admins have full access to reviews" ON reviews
  USING (is_admin());

-- ========================================================================
-- SECTION 5: PERFORMANCE OPTIMIZATIONS
-- ========================================================================

-- Add additional indexes to improve query performance

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- Courses table indexes
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);
CREATE INDEX IF NOT EXISTS idx_courses_rating_featured ON courses(rating, featured);
CREATE INDEX IF NOT EXISTS idx_courses_status_featured ON courses(status, featured);
CREATE INDEX IF NOT EXISTS idx_courses_category_status ON courses(category_id, status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

-- Sections table indexes
CREATE INDEX IF NOT EXISTS idx_sections_created_at ON sections(created_at);

-- Lessons table indexes
CREATE INDEX IF NOT EXISTS idx_lessons_duration ON lessons(duration);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at);
CREATE INDEX IF NOT EXISTS idx_lessons_free_preview ON lessons(is_free, is_preview);

-- Enrollments table indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON enrollments(created_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_status_purchased ON enrollments(status, purchased_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_completion ON enrollments(completion_percentage);

-- Progress table indexes
CREATE INDEX IF NOT EXISTS idx_progress_created_at ON progress(created_at);
CREATE INDEX IF NOT EXISTS idx_progress_completed_percentage ON progress(completed, completion_percentage);
CREATE INDEX IF NOT EXISTS idx_progress_user_completed ON progress(user_id, completed);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_rating_published ON reviews(rating, is_published);

-- Create materialized view for course statistics (requires Supabase Pro/Enterprise)
-- Uncomment if you have access to materialized views
/*
CREATE MATERIALIZED VIEW IF NOT EXISTS course_statistics AS
SELECT
  c.id AS course_id,
  c.title AS course_title,
  c.creator_id,
  p.full_name AS creator_name,
  c.category_id,
  cat.name AS category_name,
  c.status,
  c.price,
  c.rating,
  c.total_students,
  c.total_reviews,
  c.total_lessons,
  c.total_duration,
  COUNT(DISTINCT e.id) AS enrollment_count,
  COUNT(DISTINCT r.id) AS review_count,
  AVG(r.rating)::numeric(3,2) AS average_rating,
  SUM(e.amount_paid) AS total_revenue
FROM courses c
LEFT JOIN profiles p ON c.creator_id = p.id
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN reviews r ON c.id = r.course_id AND r.is_published = true
GROUP BY c.id, p.full_name, cat.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_statistics_id ON course_statistics(course_id);
*/

-- Create function to analyze tables regularly
CREATE OR REPLACE FUNCTION analyze_tables()
RETURNS void AS $$
BEGIN
  ANALYZE profiles;
  ANALYZE categories;
  ANALYZE courses;
  ANALYZE sections;
  ANALYZE lessons;
  ANALYZE enrollments;
  ANALYZE progress;
  ANALYZE reviews;
END;
$$ LANGUAGE plpgsql;

-- Create function to refresh materialized views (requires Supabase Pro/Enterprise)
-- Uncomment if you have access to materialized views
/*
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY course_statistics;
END;
$$ LANGUAGE plpgsql;
*/

-- Set up pg_cron for regular maintenance (requires Supabase Pro/Enterprise)
-- Uncomment if you have access to pg_cron extension
/*
-- Install pg_cron extension if not already installed
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly analysis of tables
SELECT cron.schedule('weekly-analyze', '0 0 * * 0', 'SELECT analyze_tables()');

-- Schedule daily refresh of materialized views
SELECT cron.schedule('daily-refresh-views', '0 1 * * *', 'SELECT refresh_materialized_views()');
*/

-- ========================================================================
-- SECTION 6: INITIAL DATA SEEDING (OPTIONAL)
-- ========================================================================

-- Insert sample categories
INSERT INTO categories (name, slug, description, color)
VALUES 
  ('Web Development', 'web-development', 'Learn to build modern web applications', '#3498db'),
  ('Data Science', 'data-science', 'Master data analysis and machine learning', '#9b59b6'),
  ('Mobile Development', 'mobile-development', 'Create apps for iOS and Android', '#2ecc71'),
  ('Design', 'design', 'Learn UI/UX and graphic design principles', '#e74c3c'),
  ('Business', 'business', 'Entrepreneurship and business skills', '#f39c12')
ON CONFLICT (slug) DO NOTHING;

-- Note: Additional sample data can be added as needed for testing purposes 