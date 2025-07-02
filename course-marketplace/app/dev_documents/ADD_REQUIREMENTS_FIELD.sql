-- SQL script to add the requirements field to the courses table
-- This script adds a JSONB column to store course requirements as an array

-- Check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'requirements'
    ) THEN
        -- Add the requirements column as JSONB type to store arrays
        ALTER TABLE courses ADD COLUMN requirements JSONB;
        
        -- Add a comment to the column
        COMMENT ON COLUMN courses.requirements IS 'Course requirements stored as a JSON array';
        
        -- Log the change
        RAISE NOTICE 'Added requirements column to courses table';
    ELSE
        RAISE NOTICE 'requirements column already exists in courses table';
    END IF;
END $$;

-- Update RLS policies to include the new column
DO $$
BEGIN
    -- Drop existing policies if they need to be updated
    DROP POLICY IF EXISTS "Creators can update their own courses" ON courses;
    DROP POLICY IF EXISTS "Admins can update any course" ON courses;
    
    -- Recreate policies with the new column
    CREATE POLICY "Creators can update their own courses" 
    ON courses FOR UPDATE 
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);
    
    CREATE POLICY "Admins can update any course" 
    ON courses FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
    
    RAISE NOTICE 'Updated RLS policies for courses table';
END $$;

-- Create a function to migrate existing requirements from description field
CREATE OR REPLACE FUNCTION migrate_requirements_from_description()
RETURNS void AS $$
DECLARE
    course_record RECORD;
    requirements_array JSONB;
    description_text TEXT;
    requirements_section TEXT;
BEGIN
    FOR course_record IN SELECT id, description FROM courses WHERE description LIKE '%Requirements:%'
    LOOP
        -- Extract requirements section from description
        description_text := course_record.description;
        requirements_section := substring(description_text FROM 'Requirements:\n(.*)$');
        
        -- Convert requirements section to array
        IF requirements_section IS NOT NULL THEN
            -- Split by newlines and remove bullet points
            requirements_array := (
                SELECT jsonb_agg(trim(BOTH '- ' FROM line))
                FROM regexp_split_to_table(requirements_section, '\n') AS line
                WHERE trim(BOTH '- ' FROM line) <> ''
            );
            
            -- Update the course with the extracted requirements
            UPDATE courses 
            SET requirements = requirements_array
            WHERE id = course_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_requirements_from_description();

-- Drop the migration function when done
DROP FUNCTION IF EXISTS migrate_requirements_from_description(); 