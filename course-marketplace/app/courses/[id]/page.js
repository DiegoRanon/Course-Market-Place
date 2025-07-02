"use client";

import { useState, useEffect } from "react";
import { getCourseById } from "@/app/lib/api/courses";
import { useAuth } from "@/app/lib/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Button from "@/app/components/ui/Button";
import LoadingState from "@/app/components/ui/LoadingState";
import ErrorState from "@/app/components/ui/ErrorState";
import CourseHeader from "@/app/components/CourseHeader";

export default function CourseDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const courseId = params?.id;
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [params?.id]);

  const fetchCourse = async (courseId) => {
    setLoading(true);
    console.log(`Fetching course details for ID: ${courseId}`);

    const { data, error } = await getCourseById(courseId);

    // Process the course data if needed
    if (data && !error) {
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
        console.log("No creator info in response");
      }

      // Ensure total_students is available
      data.students = data.total_students || 0;

      // Log video URL for debugging
      if (data.video_url) {
        console.log("Course has video URL:", data.video_url);
      } else {
        console.log("Course does not have a video URL");
      }
    } else if (error) {
      console.error("Error fetching course:", error);
    }

    setCourse(data);
    setError(error);
    setLoading(false);
  };

  const handleEnroll = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/courses/${params?.id}`);
      return;
    }

    // Handle enrollment logic
    console.log("Enrolling in course:", params?.id);
    router.push(`/learn/${params?.id}`);
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

  if (error) {
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
      <CourseHeader course={course} onEnroll={handleEnroll} />

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

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700">Price:</span>
                    <span className="text-2xl font-bold">
                      {course.price > 0
                        ? `$${parseFloat(course.price).toFixed(2)}`
                        : "Free"}
                    </span>
                  </div>

                  <Button
                    onClick={handleEnroll}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    {course.price > 0
                      ? `Enroll for $${parseFloat(course.price).toFixed(2)}`
                      : "Enroll for Free"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
