-- OPTIMIZE_DATABASE_PERFORMANCE.sql
-- Implements database performance optimizations for the Course Marketplace

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
CREATE INDEX IF NOT EXISTS idx_courses_instructor_status ON courses(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty);

-- Sections table indexes
CREATE INDEX IF NOT EXISTS idx_sections_course_position ON sections(course_id, position);

-- Lessons table indexes
CREATE INDEX IF NOT EXISTS idx_lessons_section_position ON lessons(section_id, position);
CREATE INDEX IF NOT EXISTS idx_lessons_is_free ON lessons(is_free);

-- Enrollments table indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_purchased_at ON enrollments(purchased_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status ON enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_status ON enrollments(course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_completion ON enrollments(completion_percentage);

-- Progress table indexes
CREATE INDEX IF NOT EXISTS idx_progress_completed ON progress(completed);
CREATE INDEX IF NOT EXISTS idx_progress_user_completed ON progress(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_completed ON progress(lesson_id, completed);
CREATE INDEX IF NOT EXISTS idx_progress_last_watched ON progress(last_watched_at);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_course_rating ON reviews(course_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_course_published ON reviews(course_id, is_published);

-- Create materialized views for frequently accessed data

-- Removed popular courses materialized view as per user request

-- Featured courses materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_featured_courses AS
SELECT 
  c.id,
  c.title,
  c.slug,
  c.short_description,
  c.thumbnail_url,
  c.price,
  c.rating,
  c.total_ratings,
  c.difficulty,
  c.duration_hours,
  cat.name as category_name,
  cat.slug as category_slug,
  p.full_name as instructor_name
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN profiles p ON c.creator_id = p.id
WHERE c.status = 'published' AND c.featured = true
ORDER BY c.rating DESC, c.created_at DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_featured_courses_id ON mv_featured_courses(id);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_courses;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_featured_courses;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to update materialized views when courses change
CREATE OR REPLACE FUNCTION update_course_materialized_views()
RETURNS trigger AS $$
BEGIN
  -- Schedule the refresh to happen after the transaction completes
  PERFORM pg_notify('refresh_materialized_views', '');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create an event trigger for courses table changes
DROP TRIGGER IF EXISTS trigger_update_course_materialized_views ON courses;
CREATE TRIGGER trigger_update_course_materialized_views
AFTER INSERT OR UPDATE OR DELETE ON courses
FOR EACH STATEMENT
EXECUTE FUNCTION update_course_materialized_views();

-- Create an event trigger for enrollments table changes
DROP TRIGGER IF EXISTS trigger_update_enrollment_materialized_views ON enrollments;
CREATE TRIGGER trigger_update_enrollment_materialized_views
AFTER INSERT OR UPDATE OR DELETE ON enrollments
FOR EACH STATEMENT
EXECUTE FUNCTION update_course_materialized_views();

-- Create an event trigger for reviews table changes
DROP TRIGGER IF EXISTS trigger_update_reviews_materialized_views ON reviews;
CREATE TRIGGER trigger_update_reviews_materialized_views
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH STATEMENT
EXECUTE FUNCTION update_course_materialized_views();

-- Create function to analyze tables for performance
CREATE OR REPLACE FUNCTION analyze_course_marketplace_tables()
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

-- Create a cron job to refresh materialized views daily (requires pg_cron extension)
-- Uncomment if pg_cron is available
/*
SELECT cron.schedule('0 3 * * *', $$
  SELECT refresh_materialized_views();
$$);

SELECT cron.schedule('0 4 * * 0', $$
  SELECT analyze_course_marketplace_tables();
$$);
*/

-- Optimize common queries with prepared statements

-- Prepared statement for fetching course details with related data
PREPARE get_course_details(uuid) AS
SELECT 
  c.*,
  cat.name as category_name,
  cat.slug as category_slug,
  p.full_name as instructor_name,
  p.bio as instructor_bio,
  p.avatar_url as instructor_avatar,
  COUNT(DISTINCT e.id) as student_count,
  COUNT(DISTINCT r.id) as review_count,
  COALESCE(AVG(r.rating), 0) as average_rating
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN profiles p ON c.creator_id = p.id
LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
LEFT JOIN reviews r ON c.id = r.course_id AND r.is_published = true
WHERE c.id = $1
GROUP BY c.id, cat.id, p.id;

-- Prepared statement for fetching course curriculum
PREPARE get_course_curriculum(uuid) AS
SELECT 
  s.id as section_id,
  s.title as section_title,
  s.position as section_position,
  l.id as lesson_id,
  l.title as lesson_title,
  l.description as lesson_description,
  l.position as lesson_position,
  l.is_free
FROM sections s
LEFT JOIN lessons l ON s.id = l.section_id
WHERE s.course_id = $1
ORDER BY s.position, l.position;

-- Prepared statement for fetching user enrollments with course details
PREPARE get_user_enrollments(uuid) AS
SELECT 
  e.*,
  c.title as course_title,
  c.slug as course_slug,
  c.thumbnail_url,
  c.total_lessons,
  COUNT(DISTINCT p.id) FILTER (WHERE p.completed = true) as completed_lessons
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN sections s ON s.course_id = c.id
LEFT JOIN lessons l ON l.section_id = s.id
LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = e.user_id
WHERE e.user_id = $1
GROUP BY e.id, c.id
ORDER BY e.purchased_at DESC;

-- Create partial indexes for common filtered queries

-- Partial index for published courses
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(created_at, rating)
WHERE status = 'published';

-- Partial index for featured and published courses
CREATE INDEX IF NOT EXISTS idx_courses_featured_published ON courses(rating, created_at)
WHERE featured = true AND status = 'published';

-- Partial index for active enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_active ON enrollments(user_id, purchased_at)
WHERE status = 'active';

-- Partial index for completed lessons
CREATE INDEX IF NOT EXISTS idx_progress_completed_true ON progress(user_id, last_watched_at)
WHERE completed = true;

-- Partial index for published reviews
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(course_id, rating)
WHERE is_published = true;

-- Create function to log slow queries (requires pg_stat_statements extension)
-- Uncomment if pg_stat_statements is available
/*
CREATE OR REPLACE FUNCTION log_slow_queries()
RETURNS TABLE (
  query text,
  calls bigint,
  total_time double precision,
  mean_time double precision,
  rows bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
  FROM pg_stat_statements
  WHERE mean_time > 100  -- milliseconds
  ORDER BY total_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
*/

-- Add comments to explain indexes for future maintenance
COMMENT ON INDEX idx_courses_published IS 'Optimizes queries for published courses listing';
COMMENT ON INDEX idx_courses_featured_published IS 'Optimizes queries for featured courses on homepage';
COMMENT ON INDEX idx_enrollments_active IS 'Optimizes queries for user dashboard showing active enrollments';
COMMENT ON INDEX idx_progress_completed_true IS 'Optimizes queries for tracking completed lessons';
COMMENT ON INDEX idx_reviews_published IS 'Optimizes queries for displaying course reviews';

-- Create optimized view for course listings
CREATE OR REPLACE VIEW vw_course_listings AS
SELECT 
  c.id,
  c.title,
  c.slug,
  c.short_description,
  c.thumbnail_url,
  c.price,
  c.discount_price,
  c.status,
  c.featured,
  c.rating,
  c.total_students,
  c.total_reviews,
  c.total_lessons,
  c.total_duration,
  c.level,
  c.created_at,
  c.updated_at,
  cat.id as category_id,
  cat.name as category_name,
  cat.slug as category_slug,
  p.id as creator_id,
  p.full_name as creator_name,
  p.avatar_url as creator_avatar
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN profiles p ON c.creator_id = p.id
WHERE c.status = 'published';

-- Create view for course details with related data
CREATE OR REPLACE VIEW vw_course_details AS
SELECT 
  c.id,
  c.title,
  c.slug,
  c.description,
  c.short_description,
  c.thumbnail_url,
  c.price,
  c.discount_price,
  c.status,
  c.featured,
  c.rating,
  c.total_students,
  c.total_reviews,
  c.total_lessons,
  c.total_duration,
  c.level,
  c.created_at,
  c.updated_at,
  cat.id as category_id,
  cat.name as category_name,
  cat.slug as category_slug,
  p.id as creator_id,
  p.full_name as creator_name,
  p.avatar_url as creator_avatar,
  (
    SELECT json_agg(json_build_object(
      'id', s.id,
      'title', s.title,
      'order_index', s.order_index,
      'lessons', (
        SELECT json_agg(json_build_object(
          'id', l.id,
          'title', l.title,
          'duration', l.duration,
          'is_free', l.is_free,
          'is_preview', l.is_preview,
          'order_index', l.order_index
        ) ORDER BY l.order_index)
        FROM lessons l
        WHERE l.section_id = s.id
      )
    ) ORDER BY s.order_index)
    FROM sections s
    WHERE s.course_id = c.id
  ) as curriculum
FROM courses c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN profiles p ON c.creator_id = p.id;

-- Create view for user dashboard with enrolled courses
CREATE OR REPLACE VIEW vw_user_dashboard AS
SELECT 
  e.user_id,
  e.id as enrollment_id,
  e.status as enrollment_status,
  e.purchased_at,
  e.completion_percentage,
  e.last_accessed_at,
  c.id as course_id,
  c.title as course_title,
  c.slug as course_slug,
  c.thumbnail_url,
  c.total_lessons,
  c.total_duration,
  p.id as creator_id,
  p.full_name as creator_name,
  p.avatar_url as creator_avatar,
  (
    SELECT COUNT(*) 
    FROM progress pr
    JOIN lessons l ON pr.lesson_id = l.id
    JOIN sections s ON l.section_id = s.id
    WHERE s.course_id = c.id AND pr.user_id = e.user_id AND pr.completed = true
  ) as completed_lessons
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN profiles p ON c.creator_id = p.id;

-- Create materialized view for analytics (requires Supabase Pro/Enterprise)
-- Uncomment if you have access to materialized views
/*
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_course_analytics AS
SELECT 
  c.id as course_id,
  c.title as course_title,
  c.creator_id,
  p.full_name as creator_name,
  c.category_id,
  cat.name as category_name,
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
  SUM(e.amount_paid) AS total_revenue,
  c.created_at
FROM courses c
LEFT JOIN profiles p ON c.creator_id = p.id
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN reviews r ON c.id = r.course_id AND r.is_published = true
GROUP BY c.id, p.full_name, cat.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_course_analytics_id ON mv_course_analytics(course_id);
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
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_course_analytics;
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

-- Create functions to automatically update timestamp fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Removed triggers for updated_at timestamps as per user request