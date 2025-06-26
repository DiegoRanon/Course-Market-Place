-- Add description field to profiles table for creator descriptions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description TEXT;

-- Comment on the description column
COMMENT ON COLUMN profiles.description IS 'Description field for creators to explain their expertise and content focus';

-- Update existing data (optional)
-- Only run this if needed to update existing profiles
-- UPDATE profiles 
-- SET description = 'Content creator' 
-- WHERE role = 'creator' AND description IS NULL; 