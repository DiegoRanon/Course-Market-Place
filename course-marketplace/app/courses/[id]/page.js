"use client";

import { useState, useEffect } from "react";
import { getCourseById } from "@/app/lib/api/courses";
import { useAuth } from "@/app/lib/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Button from "@/app/components/ui/Button";
import LoadingState from "@/app/components/ui/LoadingState";
import ErrorState from "@/app/components/ui/ErrorState";

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
    const { data, error } = await getCourseById(courseId);
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
      {/* Course Header Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {course.title}
          </h1>
          <p className="text-lg mb-6">
            {course.short_description || course.description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {course.price > 0 ? (
              <span className="text-2xl font-bold">
                ${parseFloat(course.price).toFixed(2)}
              </span>
            ) : (
              <span className="text-2xl font-bold">Free</span>
            )}
            <Button onClick={handleEnroll} size="lg" variant="primary">
              Enroll Now
            </Button>
          </div>
        </div>
      </div>

      {/* Main Course Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Course Image */}
          {course.image_url && (
            <div className="relative h-64 w-full">
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          )}

          {/* Course Details */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">About this course</h2>
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {course.description}
            </p>

            {course.instructor && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Instructor</h3>
                <p>{course.instructor}</p>
              </div>
            )}

            {course.what_you_will_learn && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  What you&apos;ll learn
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="list-disc list-inside space-y-1">
                    {course.what_you_will_learn
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

            <div className="border-t border-gray-200 pt-4 mt-6">
              <Button
                onClick={handleEnroll}
                size="lg"
                variant="primary"
                className="w-full md:w-auto"
              >
                Enroll Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
