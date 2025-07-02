-- ADD_CREATOR_PROFILE_ACCESS.sql
-- Adds a policy to allow public access to creator profiles for published courses

-- Add a policy to allow anyone to view creator profiles of published courses
CREATE POLICY "Anyone can view creator profiles of published courses" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE creator_id = profiles.id AND status = 'published'
    )
  );

-- Verify the policy was created
SELECT policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname; 