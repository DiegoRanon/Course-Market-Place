# Course Video RLS Policy Fix

## Issue

When uploading a video for a course, users encounter the following error:

```
❌ Error: new row violates row-level security policy
```

This error occurs because the Row Level Security (RLS) policies in Supabase are preventing the course creation with videos, even for users with admin roles.

## Root Cause Analysis

1. **Missing Storage Policies**: The storage bucket policies for course videos were not properly configured to allow uploads from authenticated users with admin roles.

2. **Incorrect Video URL Handling**: The video URL was not being properly set in the course data before submission.

3. **Missing Metadata**: When uploading videos, the metadata required by RLS policies was not being included.

## Solution

### 1. SQL Policy Updates

We've created a comprehensive SQL script (`FIX_COURSE_VIDEO_RLS.sql`) that:

- Creates and configures the course-videos storage bucket
- Adds policies for authenticated users to upload videos
- Ensures proper read access to course videos
- Updates the courses table policies to handle video URLs

Key policies added:

```sql
-- Allow authenticated users to upload course videos
CREATE POLICY "Allow authenticated users to upload course videos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-videos' AND
  auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin' OR role = 'creator')
);

-- Allow public access to course videos
CREATE POLICY "Allow public access to course videos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'course-videos');
```

### 2. Code Changes

#### CourseForm.js

- Updated `handleVideoUpload` function to:
  - Upload videos with proper metadata
  - Handle authentication properly
  - Set the video URL correctly
- Updated `handleSubmit` function to:
  - Include video URL in the course data
  - Check for valid URLs before including them

Key changes:

```javascript
// Upload with metadata to help with RLS policies
const { data: uploadData, error: uploadError } = await supabase.storage
  .from("course-videos")
  .upload(fileName, file, {
    upsert: true,
    metadata: {
      role: profile?.role || "admin",
      user_id: user?.id,
    },
  });

// Add video URL if available
if (videoFile && videoUrl && videoUrl.startsWith("http")) {
  courseData.video_url = videoUrl;
}
```

### 3. Implementation Script

We've created a Node.js script (`fix-course-video-rls.js`) that:

- Reads and executes the SQL policy updates
- Provides detailed logging of the execution
- Verifies that the policies were correctly applied

## How to Apply the Fix

### Option 1: Run the SQL Script Directly in Supabase

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `app/dev_documents/FIX_COURSE_VIDEO_RLS.sql`
4. Execute the SQL script

### Option 2: Use the Automated Script

1. Make sure you have the Supabase service role key in your environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Run the script:
   ```bash
   node fix-course-video-rls.js
   ```

## Testing the Fix

After applying the fix, you should be able to:

1. Create courses with videos as an admin user
2. Create courses with videos as a creator (for their own courses)
3. Update courses with new videos

## Verification

You can verify the fix by checking:

1. The RLS policies in Supabase:

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'courses';
   SELECT * FROM pg_policies WHERE tablename = 'objects' AND qual LIKE '%course-videos%';
   ```

2. Creating a new course with a video through the UI

## Additional Notes

- The fix maintains proper security by ensuring only authorized users can create and update courses with videos
- All changes are backward compatible with existing functionality
- The solution follows Supabase best practices for RLS policies
