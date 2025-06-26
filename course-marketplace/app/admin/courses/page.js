"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthProvider";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default function CreatorMyCourses() {
  const { user, profile, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch courses when auth is loaded and user is creator
    if (!authLoading && profile && (profile.role === "creator" || profile.role === "admin")) {
      fetchCreatorCourses();
    } else if (!authLoading && profile) {
      // Not a creator, stop loading
      setLoading(false);
    }
  }, [authLoading, profile]);

  const fetchCreatorCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch courses created by this creator
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("creator_id", profile.id)
        .order("created_at", { ascending: false });

      if (coursesError) {
        throw new Error(coursesError.message);
      }

      // For each course, fetch enrollment count
      const coursesWithAnalytics = await Promise.all(
        coursesData.map(async (course) => {
          // Get enrollment count for this course
          const { count, error: enrollmentError } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id);

          if (enrollmentError) {
            console.error("Error fetching enrollments:", enrollmentError);
            return {
              ...course,
              enrollments: 0,
              revenue: 0,
            };
          }

          // Calculate revenue (price * enrollments)
          const enrollmentCount = count || 0;
          const revenue = course.price * enrollmentCount || 0;

          return {
            ...course,
            enrollments: enrollmentCount,
            revenue,
          };
        })
      );

      setCourses(coursesWithAnalytics);
    } catch (err) {
      console.error("Error fetching creator courses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-600">Loading your courses...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access control - only creators and admins can view
  if (profile && profile.role !== "creator" && profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                <p className="text-gray-600">
                  You need creator permissions to access this page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                <p className="text-gray-600">
                  There was an error loading your courses. Please try again later.
                </p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
                <button 
                  onClick={fetchCreatorCourses}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  You don't have any courses yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Courses are created by admins. Contact an administrator to have courses assigned to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal state - display courses with analytics
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col transition-transform hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative h-48">
                {course.image_url ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={course.image_url}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-grow">
                <h3 className="font-bold text-xl text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 line-clamp-2 mb-4">
                  {course.description}
                </p>

                <div className="flex flex-col space-y-2">
                  {/* Analytics */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Enrollments
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {course.enrollments} students
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Revenue
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      ${course.revenue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <Link 
                  href={`/admin/courses/${course.id}/stats`} 
                  className="block w-full py-2 text-center text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                >
                  View Detailed Stats
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 