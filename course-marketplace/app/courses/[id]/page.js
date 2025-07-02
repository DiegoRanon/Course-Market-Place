"use client";

import { useState, useEffect } from "react";
import { getCourseById } from "@/app/lib/api/courses";
import { checkEnrollmentStatus, createEnrollment } from "@/app/lib/api/enrollments";
import { useAuth } from "@/app/lib/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Button from "@/app/components/ui/Button";
import LoadingState from "@/app/components/ui/LoadingState";
import ErrorState from "@/app/components/ui/ErrorState";
import CourseHeader from "@/app/components/CourseHeader";
import VideoPlayer from "@/app/components/VideoPlayer";

export default function CourseDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const courseId = params?.id;
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [params?.id]);

  // Check if the user is already enrolled
  useEffect(() => {
    if (user && course) {
      checkEnrollment();
    }
  }, [user, course]);

  const checkEnrollment = async () => {
    if (!user || !course) {
      console.log("Cannot check enrollment: missing user or course data");
      return;
    }
    
    try {
      console.log(`Checking enrollment for user ${user.id} in course ${course.id}`);
      
      // Add error handling around the API call
      const result = await checkEnrollmentStatus(user.id, course.id);
      const { data, error } = result || {};
      
      // Check if we got an actual error object from the API call
      if (error) {
        // Convert error to string if it's an object to make it more readable in logs
        const errorMsg = typeof error === 'object' ? JSON.stringify(error) : error;
        console.error(`Error checking enrollment status: ${errorMsg}`);
        // Don't return/exit - we'll assume user is not enrolled when there's an error
      }
      
      // If any enrollment record exists for this user and course, consider them enrolled
      // We don't check the status field anymore
      if (data) {
        console.log(`User ${user.id} is enrolled in course ${course.id}`);
        setIsEnrolled(true);
        // If enrolled, immediately show the video
        setShowVideo(true);
      } else {
        console.log(`User ${user.id} is NOT enrolled in course ${course.id}`);
      }
    } catch (err) {
      // This will catch any JS errors that occur in our function
      console.error("Exception checking enrollment:", err);
      // Don't do anything else - assume user is not enrolled
    }
  };

  const fetchCourse = async (courseId) => {
    setLoading(true);
    console.log(`Fetching course details for ID: ${courseId}`);

    try {
      const { data, error } = await getCourseById(courseId);
      
      // If we got data but still have an error, we can proceed with the data
      // This handles the case where the join query fails but we still get course data
      if (data) {
        console.log("Course data received:", {
          id: data.id,
          title: data.title,
          creator_id: data.creator_id,
          creator: data.creator,
          video_url: data.video_url,
        });
        
        // If creator info is nested, add it directly to the course object
        if (data.creator) {
          console.log("Creator info found in response:", data.creator);
          
          // If creator is an array (from join), use the first item
          if (Array.isArray(data.creator)) {
            data.creator = data.creator[0];
            console.log("Creator extracted from array:", data.creator);
          }
          
          // Set instructor info from creator data
          data.instructor = data.creator.full_name || "Unknown Instructor";
          data.instructor_avatar = data.creator.avatar_url;
        } else {
          console.log("No creator info in response, using fallback");
          // Fallback instructor info
          data.instructor = "Course Instructor";
          data.instructor_avatar = null;
        }
        
        // Ensure total_students is available
        data.students = data.total_students || 0;
        
        // Log video URL for debugging
        if (data.video_url) {
          console.log("Course has video URL:", data.video_url);
        } else {
          console.log("Course does not have a video URL");
        }
        
        setCourse(data);
        setError(null); // Clear any errors if we have data
      } else if (error) {
        console.error("Error fetching course:", error);
        setError(error);
      } else {
        // No data and no error - this shouldn't happen but handle it anyway
        console.error("No course data found and no error returned");
        setError({ message: "Could not find course information" });
      }
    } catch (err) {
      console.error("Exception while fetching course:", err);
      setError({ message: err.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      console.log("User not authenticated - redirecting to login");
      router.push(`/login?redirect=/courses/${params?.id}`);
      return;
    }

    if (!course) {
      console.error("Cannot enroll: course data is missing");
      setEnrollmentError("Course data is missing. Please try again later.");
      return;
    }

    // Start enrollment process
    setEnrollmentLoading(true);
    setEnrollmentError(null);
    
    try {
      console.log(`Creating enrollment for user ${user.id} in course ${course.id}`);
      
      const result = await createEnrollment(course.id);
      const { data, error } = result || {};
      
      if (error) {
        // Convert error to string if it's an object
        const errorMsg = typeof error === 'object' ? JSON.stringify(error) : error;
        console.error(`Error creating enrollment: ${errorMsg}`);
        setEnrollmentError(error.message || "Failed to enroll in course");
        setEnrollmentLoading(false);
        return;
      }
      
      console.log("Enrollment successful:", data);
      setIsEnrolled(true);
      
      // Show video immediately after enrollment
      setShowVideo(true);
    } catch (err) {
      console.error("Exception during enrollment:", err);
      setEnrollmentError(err.message || "An unexpected error occurred during enrollment");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingState message="Loading course details..." />
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorState
            title="Error Loading Course"
            message="There was an error loading the course details."
            details={error}
            onRetry={() => params?.id && fetchCourse(params?.id)}
          />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorState
            title="Course Not Found"
            message="The course you are looking for does not exist or has been removed."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!showVideo ? (
        // Show course header if video is not showing
        <CourseHeader course={course} onEnroll={handleEnroll} />
      ) : (
        // Show video player when enrolled and video should be shown
        <div className="bg-black py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              <p className="text-gray-300">
                by {course.instructor || "Course Instructor"}
              </p>
            </div>
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
              {enrollmentLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingState message="Preparing your course..." />
                </div>
              ) : course.video_url ? (
                <VideoPlayer 
                  videoUrl={course.video_url}
                  courseId={course.id} 
                  isCourseVideo={true}
                  autoPlay={true}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                  <p>This course doesn&apos;t have a video yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enrollment error message */}
      {enrollmentError && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {typeof enrollmentError === 'string' ? enrollmentError : "Failed to enroll in course. Please try again."}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setEnrollmentError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">About this course</h2>
                <div className="text-gray-700 mb-6 whitespace-pre-line">
                  {course.description}
                </div>

                {course.requirements && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <ul className="list-disc list-inside space-y-1">
                        {course.requirements
                          .split("\n")
                          .filter((item) => item.trim())
                          .map((item, index) => (
                            <li key={index} className="text-gray-700">
                              {item.trim()}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Curriculum Section - Removed for now */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
              <p className="text-gray-500">
                Course curriculum will be available soon.
              </p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  This course includes:
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    On-demand video
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Full lifetime access
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Access on mobile and TV
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Certificate of completion
                  </li>
                </ul>

                {/* Show enroll button if not enrolled, otherwise show "View Course" button */}
                {!isEnrolled ? (
                  <Button
                    className="w-full py-3"
                    onClick={handleEnroll}
                    disabled={enrollmentLoading}
                  >
                    {enrollmentLoading ? "Enrolling..." : "Enroll Now"}
                  </Button>
                ) : !showVideo ? (
                  <Button
                    className="w-full py-3"
                    onClick={() => setShowVideo(true)}
                  >
                    View Course
                  </Button>
                ) : (
                  <Button
                    className="w-full py-3"
                    onClick={() => router.push(`/learn/${course.id}`)}
                  >
                    Go to Course Dashboard
                  </Button>
                )}
              </div>

              <div className="bg-gray-50 p-6 border-t">
                <h4 className="font-medium text-gray-900 mb-1">
                  Not sure? Try it risk free.
                </h4>
                <p className="text-sm text-gray-600">
                  30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
