📝 Feature Specification: Course Enrollment and Immediate Video Playback
Overview
When a user visits the course presentation page (/courses/:id) and clicks the "Enroll" button, the page should immediately display a video player showing the main course video (videoCourse_url). This helps confirm that enrollment and video playback work seamlessly together.

Actors
User: Any site visitor (authenticated or not, as defined by your app’s rules).

User Story
Given I am on the course detail page (/courses/:id),
When I click the "Enroll" button,
Then I should instantly see a video player with the course’s main video (videoCourse_url),
So that I can clearly test and verify the enrollment flow and video playback implementation.

Acceptance Criteria
Course Presentation Page

Displays course details: title, description, etc.

Shows an "Enroll" button (if the user is not already enrolled).

Enrollment Action

When the "Enroll" button is clicked:

The user is enrolled in the course (update enrollments table, if needed).

The UI transitions to display a VideoPlayer component.

The VideoPlayer loads and plays the videoCourse_url associated with the course.

If already enrolled, the VideoPlayer can be shown immediately (skip the enroll step).

Video Playback

The VideoPlayer loads the videoCourse_url and displays a playable video.

The video should start quickly and show clearly (test with a real video file).

Testing Objectives

Confirm that enrollment works as expected and the user can access the video right away.

Ensure the VideoPlayer is fully functional: can play, pause, and seek in the video.

UI/UX Requirements
The transition from "Enroll" to VideoPlayer should be immediate (no page reload if possible).

Display a loading spinner or state if the video is buffering.

If the user is already enrolled, show the VideoPlayer directly (no enroll button).

Clearly display errors if video fails to load.

Database Fields Used
videoCourse_url (in the courses table)

enrollments (for tracking user enrollment, if required)

Notes
For manual testing, use a real video file URL to ensure playback quality.

The feature is focused on testing and validating both enrollment and video playback flow.

No need to implement payment or advanced access logic for this testing feature (unless needed for your full app).