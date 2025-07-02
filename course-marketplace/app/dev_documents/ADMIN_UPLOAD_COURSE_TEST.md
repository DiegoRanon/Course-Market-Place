# Admin Upload Course - Manual Testing Guide

This guide outlines the steps to test the Admin Upload Course feature, which allows administrators to create new courses and select a creator for each course.

## Prerequisites

1. You must have an admin account to access this feature
2. There must be at least one user with the role "creator" or "admin" in the system
3. Supabase storage buckets must be properly configured

## Test Cases

### 1. Access Control

- **Test Case 1.1**: Verify only admins can access the upload page

  - Steps:
    1. Log in as a non-admin user (student or creator)
    2. Try to navigate to `/admin/upload`
  - Expected Result: User should be redirected to the unauthorized page

- **Test Case 1.2**: Verify admins can access the upload page
  - Steps:
    1. Log in as an admin user
    2. Navigate to `/admin/upload`
  - Expected Result: Admin should see the course upload form

### 2. Creator Selection

- **Test Case 2.1**: Verify creator dropdown loads correctly

  - Steps:
    1. Log in as an admin
    2. Navigate to `/admin/upload`
  - Expected Result: The creator dropdown should display a list of all users with role "creator" or "admin"

- **Test Case 2.2**: Verify creator selection works
  - Steps:
    1. Select a creator from the dropdown
  - Expected Result: The selected creator should be highlighted and their ID stored in the form state

### 3. Course Creation

- **Test Case 3.1**: Create course with required fields only

  - Steps:
    1. Fill in only the required fields:
       - Title: "Test Course"
       - Short Description: "This is a test course"
       - Creator: Select any creator from dropdown
    2. Click "Create Course"
  - Expected Result: Course should be created successfully and you should be redirected to the course edit page

- **Test Case 3.2**: Create course with all fields

  - Steps:
    1. Fill in all fields:
       - Title: "Complete Test Course"
       - Slug: (auto-generated, but can be modified)
       - Creator: Select any creator
       - Short Description: "This is a complete test course"
       - Full Description: "This course covers all aspects of testing..."
       - Price: 49.99
       - Discount Price: 39.99
       - Level: "Intermediate"
       - Status: "Published"
       - Featured: Check the box
       - Upload a thumbnail image
    2. Click "Create Course"
  - Expected Result: Course should be created with all fields and you should be redirected to the course edit page

- **Test Case 3.3**: Validate required fields
  - Steps:
    1. Leave required fields empty (Title, Short Description, or Creator)
    2. Click "Create Course"
  - Expected Result: Form should show validation errors and prevent submission

### 4. Thumbnail Upload

- **Test Case 4.1**: Upload thumbnail image

  - Steps:
    1. Click "Choose File" in the thumbnail section
    2. Select an image file
  - Expected Result: Image should upload, show a success message, and display a preview

- **Test Case 4.2**: Verify invalid file types are rejected
  - Steps:
    1. Try to upload a non-image file (e.g., PDF, text file)
  - Expected Result: Browser should prevent selection or component should show an error

### 5. Database Verification

- **Test Case 5.1**: Verify course data in database

  - Steps:
    1. After creating a course, check the database
    2. Query the `courses` table for the newly created course
  - Expected Result: All fields should match what was entered in the form, including the correct creator_id

- **Test Case 5.2**: Verify thumbnail URL in database
  - Steps:
    1. Check the `thumbnail_url` field in the database
  - Expected Result: It should contain a valid Supabase storage URL that loads the uploaded image

## Troubleshooting

If you encounter issues during testing:

1. Check browser console for JavaScript errors
2. Verify Supabase storage permissions for the course-thumbnails bucket
3. Ensure the profiles table has users with "creator" or "admin" roles
4. Check that the courses table has all the required fields

## Notes

- The slug is auto-generated from the title but can be manually edited
- Featured courses will appear in the featured section on the homepage
- Course status defaults to "draft" - only "published" courses will appear in course listings
