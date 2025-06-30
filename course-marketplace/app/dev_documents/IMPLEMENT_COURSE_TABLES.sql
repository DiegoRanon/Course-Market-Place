-- IMPLEMENT_COURSE_TABLES.sql
-- Implements course and curriculum tables for the Course Marketplace

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
  creator_id uuid REFERENCES profiles(id),
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

-- RLS Policies for Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Only admins can insert/update/delete categories
CREATE POLICY "Only admins can modify categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Courses
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Creators can view their own courses" ON courses;
DROP POLICY IF EXISTS "Creators can create courses" ON courses;
DROP POLICY IF EXISTS "Creators can update own courses" ON courses;
DROP POLICY IF EXISTS "Admins have full access to courses" ON courses;

-- Published courses are viewable by everyone
CREATE POLICY "Published courses are viewable by everyone" ON courses
  FOR SELECT USING (status = 'published');

-- Creators can view their own courses (draft/published)
CREATE POLICY "Creators can view their own courses" ON courses
  FOR SELECT USING (creator_id = auth.uid());

-- Creators can create courses
CREATE POLICY "Creators can create courses" ON courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('creator', 'admin')
    )
  );

-- Creators can update their own courses
CREATE POLICY "Creators can update own courses" ON courses
  FOR UPDATE USING (creator_id = auth.uid());

-- Admins have full access to courses
CREATE POLICY "Admins have full access to courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Sections
DROP POLICY IF EXISTS "Sections of published courses are viewable by everyone" ON sections;
DROP POLICY IF EXISTS "Creators can manage own course sections" ON sections;
DROP POLICY IF EXISTS "Admins have full access to sections" ON sections;

-- Sections of published courses are viewable by everyone
CREATE POLICY "Sections of published courses are viewable by everyone" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id AND courses.status = 'published'
    )
  );

-- Creators can manage sections for their courses
CREATE POLICY "Creators can manage own course sections" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = sections.course_id AND courses.creator_id = auth.uid()
    )
  );

-- Admins have full access to sections
CREATE POLICY "Admins have full access to sections" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Lessons
DROP POLICY IF EXISTS "Free/preview lessons of published courses are viewable by everyone" ON lessons;
DROP POLICY IF EXISTS "Enrolled users can view all lessons of the course" ON lessons;
DROP POLICY IF EXISTS "Creators can manage own course lessons" ON lessons;
DROP POLICY IF EXISTS "Admins have full access to lessons" ON lessons;

-- Free/preview lessons of published courses are viewable by everyone
CREATE POLICY "Free/preview lessons of published courses are viewable by everyone" ON lessons
  FOR SELECT USING (
    (is_free = true OR is_preview = true) AND EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON sections.course_id = courses.id
      WHERE sections.id = lessons.section_id AND courses.status = 'published'
    )
  );

-- Enrolled users can view all lessons of the course
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

-- Creators can manage lessons for their courses
CREATE POLICY "Creators can manage own course lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN courses ON sections.course_id = courses.id
      WHERE sections.id = lessons.section_id AND courses.creator_id = auth.uid()
    )
  );

-- Admins have full access to lessons
CREATE POLICY "Admins have full access to lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update course lesson count
CREATE OR REPLACE FUNCTION update_course_lesson_count()
RETURNS trigger AS $$
BEGIN
  -- Update total lessons count
  UPDATE courses
  SET total_lessons = (
    SELECT COUNT(*)
    FROM lessons
    JOIN sections ON lessons.section_id = sections.id
    WHERE sections.course_id = (
      SELECT course_id FROM sections WHERE id = NEW.section_id
    )
  )
  WHERE id = (SELECT course_id FROM sections WHERE id = NEW.section_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lesson count
DROP TRIGGER IF EXISTS update_course_lesson_count_trigger ON lessons;
CREATE TRIGGER update_course_lesson_count_trigger
  AFTER INSERT OR DELETE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_course_lesson_count();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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