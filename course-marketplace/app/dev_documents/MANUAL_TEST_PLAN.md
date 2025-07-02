# Manual Test Plan for Course Page and Video Player

This document outlines steps to manually verify that the Course Page and Video Player implementations are working correctly.

## 1. Course Page Tests

### 1.1 Course Details Display

- Navigate to `/courses/[id]` where `[id]` is a valid course ID
- Verify that the course header displays:
  - Course title
  - Instructor name
  - Course description
  - Price and enrollment button
  - What you'll learn section
  - Requirements section
- Test responsive layout on different screen sizes

### 1.2 Curriculum Display

- Verify that the curriculum section shows all sections and lessons for the course
- Test expanding/collapsing sections by clicking on section headers
- Verify that free lessons are marked with "Free Preview"
- Verify that premium lessons show a lock icon for non-enrolled users
- Verify that the lesson count and total duration are displayed correctly

### 1.3 Enrollment Button

- When not logged in, clicking enroll should redirect to login
- When logged in but not enrolled, clicking enroll should initiate enrollment process
- When already enrolled, button should change to "Continue Learning"

## 2. Video Player Tests

### 2.1 Basic Video Functionality

- Navigate to `/learn/[courseId]/[lessonId]` where you have access to the lesson
- Verify that the video loads and plays correctly
- Test play/pause button functionality
- Test video progress bar functionality (click to seek)
- Test volume control and mute toggle
- Test fullscreen toggle

### 2.2 Progress Tracking

- Play a video for at least 10 seconds, then refresh the page
- Verify that the video resumes from where you left off
- Complete watching a video and verify it's marked as completed in the curriculum
- Verify that course progress percentage updates correctly

### 2.3 Access Control

- Try accessing a premium lesson without enrollment
- Verify that you see an "Access Restricted" message
- Enroll in the course and verify you can now access the lesson
- Try accessing a free preview lesson without enrollment
- Verify that you can watch the free preview without enrolling

## 3. Course Navigation

- Verify that you can navigate between lessons using "Previous" and "Next" buttons
- Verify that the course sidebar shows the correct structure with appropriate highlighting
- Verify that completed lessons are visually marked

## 4. Error Cases

- Test with invalid course or lesson IDs
- Test with invalid or expired video URLs
- Test with network interruptions during video playback
- Verify appropriate error messages are displayed

## 5. Mobile Experience

- Test video player controls on mobile devices
- Verify that the video player is responsive
- Test touch controls for play/pause and seeking
- Test course navigation on small screens

## 6. Browser Compatibility

- Test on Chrome, Firefox, Safari, and Edge
- Verify that video player works correctly on all supported browsers

## 6. RLS Policy Testing

#### Test 6.1: Course Creation with Thumbnail as Admin

1. Log in with administrator credentials
2. Navigate to `/admin/upload`
3. Fill in all required course fields
4. Upload a thumbnail image
5. Click "Create Course"
6. **Expected Result**: Course should be created successfully with the thumbnail, and no RLS policy error should occur

#### Test 6.2: Course Creation with Thumbnail as Creator

1. Log in with creator credentials
2. Navigate to `/admin/upload`
3. Fill in all required course fields (ensure creator is set to the logged-in creator)
4. Upload a thumbnail image
5. Click "Create Course"
6. **Expected Result**: Course should be created successfully with the thumbnail, and no RLS policy error should occur

#### Test 6.3: Course Update with New Thumbnail

1. Log in with administrator credentials
2. Navigate to a course edit page
3. Upload a new thumbnail image
4. Save the course
5. **Expected Result**: Course should be updated successfully with the new thumbnail, and no RLS policy error should occur

#### Test 6.4: Course Creation with Video as Admin

1. Log in with administrator credentials
2. Navigate to `/admin/upload`
3. Fill in all required course fields
4. Upload a video file
5. Click "Create Course"
6. **Expected Result**: Course should be created successfully with the video, and no RLS policy error should occur

#### Test 6.5: Course Creation with Video as Creator

1. Log in with creator credentials
2. Navigate to `/admin/upload`
3. Fill in all required course fields (ensure creator is set to the logged-in creator)
4. Upload a video file
5. Click "Create Course"
6. **Expected Result**: Course should be created successfully with the video, and no RLS policy error should occur

#### Test 6.6: Course Update with New Video

1. Log in with administrator credentials
2. Navigate to a course edit page
3. Upload a new video file
4. Save the course
5. **Expected Result**: Course should be updated successfully with the new video, and no RLS policy error should occur

#### Test 6.7: Course Creation with Both Thumbnail and Video

1. Log in with administrator credentials
2. Navigate to `/admin/upload`
3. Fill in all required course fields
4. Upload both a thumbnail image and a video file
5. Click "Create Course"
6. **Expected Result**: Course should be created successfully with both the thumbnail and video, and no RLS policy error should occur

---

After completing these tests, mark Task #5 "Implement Course Page and Video Player" as done if all tests pass. Document any issues found for future improvements.

# Manual Testing Plan: Course Video Upload Feature

## Overview

This document outlines the manual testing procedures for the course video upload feature. The feature allows administrators to upload promotional videos for courses, which are then displayed on the course details page.

## Prerequisites

- Administrator account credentials
- Sample video files in MP4, WebM, and OGG formats (various sizes)
- Access to the application in a testing environment

## Test Environment Setup

1. Log in with administrator credentials
2. Navigate to the admin upload page at `/admin/upload`

## Test Cases

### 1. Course Form Video Upload UI

#### Test 1.1: Video upload section visibility

1. Navigate to `/admin/upload`
2. Observe the form
3. **Expected Result**: The form should include a video upload section with a clear label "Course Video"

#### Test 1.2: Video upload drag-and-drop

1. Drag a valid video file onto the upload area
2. **Expected Result**: The upload area should highlight when a file is dragged over it

#### Test 1.3: Video upload button

1. Click on the "Upload Video" button
2. Select a valid video file
3. **Expected Result**: The file selection dialog should open and allow selecting video files

#### Test 1.4: Video preview after selection

1. Upload a valid video file
2. **Expected Result**: A video player should appear showing the selected video with playback controls

#### Test 1.5: Video file type validation message

1. Attempt to upload a non-video file (e.g., PDF)
2. **Expected Result**: An error message should appear stating "Please upload a valid video file (MP4, WebM, OGG)"

#### Test 1.6: Video file size validation message

1. Attempt to upload a video larger than 500MB
2. **Expected Result**: An error message should appear stating "File size exceeds the 500MB limit"

### 2. Course Creation with Video

#### Test 2.1: Create course with video

1. Fill in all required course fields
2. Upload a valid video
3. Click "Create Course"
4. **Expected Result**: The form should submit successfully and redirect to the courses list page

#### Test 2.2: Create course without video

1. Fill in all required course fields
2. Do not upload a video
3. Click "Create Course"
4. **Expected Result**: The form should submit successfully (video is optional)

#### Test 2.3: Form validation with video

1. Upload a valid video
2. Leave required fields empty
3. Click "Create Course"
4. **Expected Result**: Form should show validation errors for required fields while keeping the video preview

#### Test 2.4: Video replacement

1. Upload a video
2. Click "Replace" or upload another video
3. **Expected Result**: The new video should replace the previous one in the preview

### 3. Course Video Display on Course Page

#### Test 3.1: Video thumbnail display

1. Navigate to a course page that has a video
2. Observe the course header
3. **Expected Result**: The course should display a thumbnail with a play button overlay

#### Test 3.2: Video playback

1. On the course page, click the play button on the thumbnail
2. **Expected Result**: The video should start playing in place of the thumbnail

#### Test 3.3: Video player controls

1. Play the course video
2. Test play/pause, volume, and fullscreen controls
3. **Expected Result**: All video controls should function properly

#### Test 3.4: Video fallback to image

1. Navigate to a course page without a video
2. **Expected Result**: The course should display only the course image without a play button

### 4. Creator Selection

#### Test 4.1: Creator dropdown visibility

1. Navigate to `/admin/upload`
2. Observe the form
3. **Expected Result**: The form should include a dropdown to select course creators

#### Test 4.2: Creator list population

1. Open the creator dropdown
2. **Expected Result**: The dropdown should list all available creators

#### Test 4.3: Creator selection

1. Select a creator from the dropdown
2. Complete the form and submit
3. **Expected Result**: The course should be created and associated with the selected creator

### 5. Error Handling

#### Test 5.1: Network error during upload

1. Disable network connection
2. Attempt to upload a video
3. **Expected Result**: An appropriate error message should be displayed

#### Test 5.2: Server error simulation

1. Upload a valid video
2. Simulate a server error during form submission
3. **Expected Result**: An error message should be displayed, and the form data should be preserved

#### Test 5.3: Invalid video format

1. Rename a non-video file to have a .mp4 extension
2. Upload this file
3. **Expected Result**: The system should detect the invalid format and show an error message

### 6. Performance

#### Test 6.1: Large video upload

1. Upload a video close to but under the 500MB limit
2. **Expected Result**: The upload should proceed with a visible progress indicator

#### Test 6.2: Multiple form submissions

1. Submit the form with a video multiple times in succession
2. **Expected Result**: Each submission should be handled correctly without data corruption

#### Test 6.3: Video loading performance

1. Navigate to a course page with a video
2. Observe video loading time
3. **Expected Result**: The video should load within a reasonable time frame with proper buffering

## Bug Reporting Template

If you encounter issues during testing, please report them using the following format:

```
Bug Report: [Brief Description]

Test ID: [Reference to the test case above]
Severity: [Critical/High/Medium/Low]
Environment: [Browser, OS, Screen size]

Steps to Reproduce:
1.
2.
3.

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots/Videos:
[If applicable]

Additional Notes:
[Any other relevant information]
```

## Testing Checklist

- [ ] All UI elements for video upload are displayed correctly
- [ ] Video file type validation works properly
- [ ] Video file size validation works properly
- [ ] Video preview functionality works as expected
- [ ] Course creation with video completes successfully
- [ ] Course video displays correctly on the course page
- [ ] Video playback controls function properly
- [ ] Creator selection works correctly
- [ ] Error handling for various scenarios works as expected
- [ ] Performance is acceptable for various video sizes
