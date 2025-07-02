# RLS Policy & Video Preview Fix Implementation Checklist

## Prerequisites

- [ ] Supabase admin access
- [ ] Service role key for Supabase
- [ ] Access to deployment environment

## SQL Updates

- [ ] Run `fix-course-thumbnail-rls.js` script to apply SQL changes for thumbnails
- [ ] Run `fix-course-video-rls.js` script to apply SQL changes for videos
- [ ] Verify policies are correctly applied in Supabase dashboard
- [ ] Check that all required policies are created:
  - [ ] "Courses can be created by admin or creator"
  - [ ] "Admins can update any course"
  - [ ] "Creators can update their own courses"
  - [ ] "Everyone can read published courses"
  - [ ] "Admins can read all courses"
  - [ ] "Creators can read their own courses"
  - [ ] "Allow authenticated users to upload course thumbnails"
  - [ ] "Allow authenticated users to upload course videos"

## Component Updates

- [ ] Update `VideoPlayer` component to properly handle video URLs
- [ ] Fix error handling in `VideoPlayer` component
- [ ] Enhance video controls for better user experience
- [ ] Update `CourseForm` component to properly handle video uploads
- [ ] Update `CourseHeader` component to properly display videos

## Testing

- [ ] Run `npm test admin-upload-thumbnail.test.js` to verify thumbnail upload fix
- [ ] Run `npm test admin-upload-video.test.js` to verify video upload fix
- [ ] Run `npm test video-player.test.js` to verify video player fix
- [ ] Run `npm test video-display.test.js` to verify video display fix
- [ ] Manually test thumbnail upload in the admin interface
- [ ] Manually test video upload in the admin interface
- [ ] Manually test video playback on course pages

## Documentation

- [ ] Review and update `COURSE_THUMBNAIL_RLS_FIX.md`
- [ ] Review and update `COURSE_VIDEO_RLS_FIX.md`
- [ ] Review and update `VIDEO_PREVIEW_FIX.md`
- [ ] Review and update `RLS_POLICY_FIX_SUMMARY.md`
- [ ] Update `IMPLEMENTATION_CHECKLIST.md` with all required steps

## Deployment

- [ ] Deploy SQL changes to production
- [ ] Deploy component updates to production
- [ ] Verify functionality in production environment
- [ ] Monitor for any issues after deployment

## Database Schema Fixes

- [x] Fix infinite recursion in RLS policies
- [x] Fix course thumbnail RLS policies
- [x] Fix course video RLS policies
- [x] Fix creator profile access
- [x] Add requirements field to courses table
  - Implemented a workaround in CourseForm.js to handle missing requirements column
  - Created SQL migration script to add the requirements column
  - Added error handling to retry course creation without requirements field if error occurs
  - Documented the fix in REQUIREMENTS_FIELD_FIX.md
  - Removed unused what_you_will_learn field from the form and course detail page
- [x] Fix course URL fields inconsistency
  - Updated CourseForm.js to use the correct field names (thumbnail_url and video_url)
  - Created SQL migration script to consolidate courseVideo_url into video_url
  - Created SQL migration script to consolidate image_url into thumbnail_url
  - Added appropriate indexes and comments to the columns
  - Documented the fix in COURSE_URL_FIELDS_FIX.md
