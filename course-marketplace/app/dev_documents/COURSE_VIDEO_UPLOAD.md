# Course Video Upload Feature

This document outlines the implementation of the course video upload feature, which allows administrators to upload videos for courses.

## Overview

The course video upload feature enables administrators to upload video files (.mp4, .webm, .ogg) when creating or editing courses. The videos are stored in a Supabase storage bucket named "course-videos" and the URL is saved in the `video_url` field of the courses table.

## Implementation Details

### Database Schema Update

The `courses` table has been updated to include a new field:

```sql
ALTER TABLE courses ADD COLUMN video_url TEXT;
```

This field stores the path to the uploaded video in the Supabase storage bucket.

### Component Updates

#### CourseForm Component

The CourseForm component has been updated to include a video upload section:

- Added video file upload functionality using the UploadBox component
- Added validation for video file types (MP4, WebM, OGG)
- Set maximum file size to 500MB
- Added preview functionality to display the uploaded video before submission
- Updated the form submission handler to upload the video to Supabase storage

#### VideoPlayer Component

The VideoPlayer component has been enhanced to support course videos:

- Added a new `isCourseVideo` prop to distinguish between course videos and lesson videos
- Updated the bucket selection logic to use "course-videos" for course videos
- Improved the video player UI for better user experience

#### CourseHeader Component

The CourseHeader component has been updated to display the course video:

- Added a play button overlay on the course thumbnail when a video is available
- Implemented a toggle to switch between thumbnail and video display
- Added the VideoPlayer component to play the course video

### Storage Bucket

A new storage bucket named "course-videos" has been created in Supabase to store the uploaded course videos.

### API Updates

The `createCourse` function in `courses.js` has been updated to handle the `video_url` field:

- Updated validation logic to include the new field structure
- Modified the course creation process to include the video URL

## Usage

1. When creating a new course, administrators can upload a video file in the "Course Video" section.
2. The video must be in MP4, WebM, or OGG format and cannot exceed 500MB.
3. A preview of the uploaded video is displayed before submission.
4. After the course is created, the video is accessible on the course details page.
5. Users can view the course video by clicking the play button on the course thumbnail.

## Testing

The feature has been tested with various video formats and sizes to ensure compatibility and performance. The tests cover:

- Video upload functionality
- Video preview display
- Video playback on the course details page
- Error handling for invalid file types and sizes

## Future Enhancements

Potential future enhancements for the course video upload feature include:

- Video transcoding to optimize for different device types and network conditions
- Video analytics to track user engagement
- Support for multiple course videos
- Video captions and subtitles
- Integration with video streaming services for improved performance
