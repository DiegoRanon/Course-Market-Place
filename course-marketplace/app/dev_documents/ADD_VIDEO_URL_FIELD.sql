-- Add video_url field to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment to the field
COMMENT ON COLUMN courses.video_url IS 'URL to the course video stored in Supabase storage';

-- Update RLS policies to allow access to video_url field
CREATE POLICY "Public users can view course videos" ON courses
    FOR SELECT
    USING (status = 'published')
    WITH CHECK (status = 'published');

-- Creators can view their own course videos
CREATE POLICY "Creators can view their own course videos" ON courses
    FOR SELECT
    USING (creator_id = auth.uid())
    WITH CHECK (creator_id = auth.uid());

-- Admins can view all course videos
CREATE POLICY "Admins can view all course videos" ON courses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Update existing policies to include video_url field
-- This is a reminder to check existing policies to ensure they properly handle the new field 