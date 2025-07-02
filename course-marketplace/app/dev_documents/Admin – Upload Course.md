📝 Feature Specification: Admin – Upload Course
Overview
As an admin, I want to upload a new course, including its details and primary video, to the platform so that it can be prepared for publishing and eventual enrollment.

Actors
Admin: Authenticated user with administrative privileges.

User Story
Given I am logged in as an admin,
When I navigate to the "Upload Course" page,
Then I can fill out the course details and upload a video file,
So that a new course is added to the platform in draft, ready for review or publishing.

Acceptance Criteria

1. Course Details Form
   Title (text, required)

Slug (text, required, URL-safe and unique)

Short Description (text, required)

Long Description (textarea, optional)

Thumbnail Upload (image file, required)

Video Upload (video file, e.g., .mp4, required)

Category (dropdown, required; pulled from categories table)

Feature Checkbox (featured boolean)

Price (numeric, required)

Discount Price (discount_price, numeric, optional)

Level (dropdown: beginner, intermediate, advanced, all-levels, required)

Status (draft by default, but can set as published)

2. Backend Integration
   Upon form submission:

Video file is uploaded to Supabase Storage (or similar cloud storage).

Thumbnail is uploaded to Supabase Storage.

New course row is created in the courses table, with:

All submitted fields.

The storage URL of the uploaded video and thumbnail.

creator_id set to the admin’s profile.id.

Timestamps for created_at and updated_at.

3. Validation & Error Handling
   All required fields must be filled.

Price and discount_price must be valid numbers (discount price less than price).

Slug must be unique; system should show a clear error if it already exists.

File uploads should accept only valid types (image for thumbnail, video for main video).

Show upload progress and clear errors if any step fails.

4. UI/UX
   Responsive design.

Loading indicators during uploads.

Success message and redirect to course management/dashboard upon successful creation.

Form reset or error state if upload fails.

5. Optional / Future
   Multiple video uploads (multi-lesson structure).

Rich text editor for descriptions.

Tagging and prerequisites.

Database Fields Used
title

slug

description

short_description

thumbnail_url

category_id

creator_id

price

discount_price

status

featured

level

created_at, updated_at

Non-Functional Requirements
All uploads and data operations must complete within 5 seconds under normal network conditions.

Must support video files up to at least 1GB.

Notes
Don't use the section table, it will be for the future.
We will only use one long format video for the course.
