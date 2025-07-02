-- SQL script to update the courses table to use the correct field names for thumbnail_url and video_url

-- Check if the courseVideo_url column exists and remove it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'courseVideo_url'
    ) THEN
        -- Move data from courseVideo_url to video_url if video_url is empty
        UPDATE courses
        SET video_url = courseVideo_url
        WHERE courseVideo_url IS NOT NULL 
        AND (video_url IS NULL OR video_url = '');
        
        -- Drop the courseVideo_url column
        ALTER TABLE courses DROP COLUMN courseVideo_url;
        
        RAISE NOTICE 'Removed courseVideo_url column and migrated data to video_url';
    ELSE
        RAISE NOTICE 'courseVideo_url column does not exist, no action needed';
    END IF;
END$$;

-- Ensure the thumbnail_url and video_url columns exist and have the correct names
DO $$
BEGIN
    -- Check if image_url exists and rename it to thumbnail_url if needed
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'image_url'
    ) THEN
        -- Move data from image_url to thumbnail_url if thumbnail_url is empty
        UPDATE courses
        SET thumbnail_url = image_url
        WHERE image_url IS NOT NULL 
        AND (thumbnail_url IS NULL OR thumbnail_url = '');
        
        -- Drop the image_url column
        ALTER TABLE courses DROP COLUMN image_url;
        
        RAISE NOTICE 'Renamed image_url column to thumbnail_url';
    ELSE
        RAISE NOTICE 'image_url column does not exist, no action needed';
    END IF;
END$$;

-- Add comments to the columns
COMMENT ON COLUMN courses.thumbnail_url IS 'URL to the course thumbnail image';
COMMENT ON COLUMN courses.video_url IS 'URL to the main course preview video';

-- Create indexes for the URL columns
CREATE INDEX IF NOT EXISTS courses_thumbnail_url_idx ON courses(thumbnail_url);
CREATE INDEX IF NOT EXISTS courses_video_url_idx ON courses(video_url);

-- Log the completion
DO $$
BEGIN
    RAISE NOTICE 'Course URL fields update completed successfully';
END$$; 