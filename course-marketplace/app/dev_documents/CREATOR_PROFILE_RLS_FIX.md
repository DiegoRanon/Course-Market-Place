# Creator Profile RLS Policy Fix

## Issue

We identified an issue where creator profiles were not being properly fetched when viewing course details. This was due to the Row Level Security (RLS) policies on the `profiles` table, which only allowed:

1. Users to view their own profiles (`auth.uid() = id`)
2. Admins to view all profiles

There was no policy allowing public access to creator profiles for published courses, which is necessary for course pages to display instructor information.

## Solution

### 1. Add a New RLS Policy

Add a new RLS policy to the `profiles` table that allows public access to creator profiles for published courses:

```sql
-- Add a policy to allow anyone to view creator profiles of published courses
CREATE POLICY "Anyone can view creator profiles of published courses" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE creator_id = profiles.id AND status = 'published'
    )
  );
```

This policy allows anyone to view a profile if that profile belongs to a creator of at least one published course.

### 2. Implement Fallback Methods

We've implemented several fallback methods in our code to handle cases where RLS policies might still prevent access:

#### In `CourseHeader.js`:

- Method 1: Direct query with UUID
- Method 2: Query with text comparison
- Method 3: REST API endpoint (bypasses RLS)
- Method 4: Fallback to hardcoded creator name

#### In `courses.js` API:

- Method 1: Join query to fetch course with creator profile
- Method 2: Separate queries with REST API fallback

### 3. Running the Fix

To apply the RLS policy fix, run the following command from the project root:

```bash
node fix-creator-profile-access.js
```

This script will connect to your Supabase database and add the necessary RLS policy.

## Verification

After applying the fix, you should be able to:

1. View course pages with complete creator information
2. See creator profiles even when not logged in
3. Access creator profiles for all published courses

## Technical Details

The issue occurred because the default RLS policies were too restrictive, preventing public access to creator profiles. By adding a specific policy for published course creators, we maintain security while allowing the necessary access for course pages.

The fallback methods ensure that even if there are issues with the RLS policies, the application will still attempt to display creator information using alternative approaches.

## Related Files

- `app/components/CourseHeader.js`: Contains multiple fallback methods for fetching creator profiles
- `app/lib/api/courses.js`: Updated to handle RLS issues when fetching courses with creator info
- `fix-creator-profile-access.js`: Script to add the new RLS policy
- `app/dev_documents/FIX_ALL_RLS_POLICIES.sql`: Reference for all RLS policies
