-- IMPLEMENT_ENROLLMENT_TABLES.sql
-- Implements enrollment and progress tracking tables for the Course Marketplace

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS enrollments_status_idx ON enrollments(status);
CREATE INDEX IF NOT EXISTS enrollments_purchased_idx ON enrollments(purchased_at);

-- Create progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completion_percentage integer DEFAULT 0,
  last_position integer DEFAULT 0, -- Video position in seconds
  last_watched_at timestamp with time zone DEFAULT now(),
  watch_time integer DEFAULT 0, -- Total seconds spent watching
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS progress_user_id_idx ON progress(user_id);
CREATE INDEX IF NOT EXISTS progress_lesson_id_idx ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS progress_completed_idx ON progress(completed);
CREATE INDEX IF NOT EXISTS progress_last_accessed_idx ON progress(last_position);

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_course_id_idx ON reviews(course_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_published_idx ON reviews(is_published);

-- RLS Policies for Enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Creators can view enrollments for their courses" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (user_id = auth.uid());

-- Creators can view enrollments for their courses
CREATE POLICY "Creators can view enrollments for their courses" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = enrollments.course_id AND creator_id = auth.uid()
    )
  );

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage all enrollments" ON enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Progress
DROP POLICY IF EXISTS "Users can manage own progress" ON progress;
DROP POLICY IF EXISTS "Creators can view progress for their courses" ON progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON progress;

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON progress
  FOR ALL USING (user_id = auth.uid());

-- Creators can view progress for their courses
CREATE POLICY "Creators can view progress for their courses" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN sections ON lessons.section_id = sections.id
      JOIN courses ON sections.course_id = courses.id
      WHERE lessons.id = progress.lesson_id AND courses.creator_id = auth.uid()
    )
  );

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Reviews
DROP POLICY IF EXISTS "Anyone can view published reviews" ON reviews;
DROP POLICY IF EXISTS "Users can manage own reviews" ON reviews;
DROP POLICY IF EXISTS "Creators can view reviews for their courses" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- Anyone can view published reviews
CREATE POLICY "Anyone can view published reviews" ON reviews
  FOR SELECT USING (is_published = true);

-- Users can manage their own reviews
CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL USING (user_id = auth.uid());

-- Creators can view all reviews for their courses
CREATE POLICY "Creators can view reviews for their courses" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = reviews.course_id AND creator_id = auth.uid()
    )
  );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update course rating when a review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS trigger AS $$
BEGIN
  -- Update course rating and total_ratings
  UPDATE courses
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        AND is_published = true
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        AND is_published = true
    )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for course rating
DROP TRIGGER IF EXISTS update_course_rating_trigger ON reviews;
CREATE TRIGGER update_course_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating();

-- Function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS trigger AS $$
BEGIN
  -- Update total_students count
  UPDATE courses
  SET total_students = (
    SELECT COUNT(*)
    FROM enrollments
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
      AND status = 'active'
  )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enrollment count
DROP TRIGGER IF EXISTS update_course_enrollment_count_trigger ON enrollments;
CREATE TRIGGER update_course_enrollment_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_enrollment_count();

-- Function to update enrollment completion percentage
CREATE OR REPLACE FUNCTION update_enrollment_completion()
RETURNS trigger AS $$
DECLARE
  lesson_course_id uuid;
  total_lessons integer;
  completed_lessons integer;
BEGIN
  -- Get the course_id for this lesson
  SELECT courses.id INTO lesson_course_id
  FROM lessons
  JOIN sections ON lessons.section_id = sections.id
  JOIN courses ON sections.course_id = courses.id
  WHERE lessons.id = NEW.lesson_id;
  
  -- Get total lessons count for the course
  SELECT COUNT(*) INTO total_lessons
  FROM lessons
  JOIN sections ON lessons.section_id = sections.id
  WHERE sections.course_id = lesson_course_id;
  
  -- Get completed lessons count for the user in this course
  SELECT COUNT(*) INTO completed_lessons
  FROM progress
  JOIN lessons ON progress.lesson_id = lessons.id
  JOIN sections ON lessons.section_id = sections.id
  WHERE sections.course_id = lesson_course_id
    AND progress.user_id = NEW.user_id
    AND progress.completed = true;
  
  -- Update enrollment completion percentage
  IF total_lessons > 0 THEN
    UPDATE enrollments
    SET 
      completion_percentage = (completed_lessons * 100 / total_lessons),
      last_accessed_at = NOW(),
      -- If all lessons are completed, mark the enrollment as completed
      status = CASE WHEN completed_lessons = total_lessons THEN 'completed' ELSE status END
    WHERE user_id = NEW.user_id AND course_id = lesson_course_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enrollment completion
DROP TRIGGER IF EXISTS update_enrollment_completion_trigger ON progress;
CREATE TRIGGER update_enrollment_completion_trigger
  AFTER INSERT OR UPDATE ON progress
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION update_enrollment_completion();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
BEFORE UPDATE ON progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 