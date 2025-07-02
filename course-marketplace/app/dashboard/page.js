"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "../components/dashboard/Sidebar";
import DashboardCourseCard from "../components/dashboard/CourseCard";
import { supabase } from "../lib/supabase";
import {
  getEnrolledCourses,
  filterAndSortEnrolledCourses,
  checkDatabaseSchema,
} from "../lib/api/courses";

// Custom hook that tracks whether the current page/tab is visible to the user
function usePageVisibility() {
  // Default to true if no visibility API
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined" 
      ? document.visibilityState === "visible" 
      : true
  );
  
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    
    // Initial check
    handleVisibilityChange();
    
    // Add event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
}

// Temporary function to create a sample enrollment for testing
async function createSampleEnrollment(userId) {
  try {
    // First check if there are any courses
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id")
      .limit(1);

    if (coursesError) {
      console.error("Error checking for courses:", coursesError);
      return;
    }

    // If no courses exist, create a sample course
    let courseId;
    if (!courses || courses.length === 0) {
      const { data: newCourse, error: newCourseError } = await supabase
        .from("courses")
        .insert({
          title: "Sample Course",
          description: "This is a sample course for testing",
          price: 29.99,
          is_published: true,
          creator_id: userId,
          thumbnail_url: "https://via.placeholder.com/300x200",
        })
        .select();

      if (newCourseError) {
        console.error("Error creating sample course:", newCourseError);
        return;
      }

      courseId = newCourse[0].id;

      // Create a sample section
      const { data: section, error: sectionError } = await supabase
        .from("sections")
        .insert({
          course_id: courseId,
          title: "Introduction",
          order: 1,
        })
        .select();

      if (sectionError) {
        console.error("Error creating sample section:", sectionError);
        return;
      }

      // Create sample lessons
      const { error: lessonsError } = await supabase.from("lessons").insert([
        {
          section_id: section[0].id,
          title: "Getting Started",
          description: "Learn the basics",
          order: 1,
          duration: 600,
          video_url: "https://example.com/video1",
        },
        {
          section_id: section[0].id,
          title: "Advanced Concepts",
          description: "Dive deeper",
          order: 2,
          duration: 900,
          video_url: "https://example.com/video2",
        },
      ]);

      if (lessonsError) {
        console.error("Error creating sample lessons:", lessonsError);
      }
    } else {
      courseId = courses[0].id;
    }

    // Check if enrollment already exists
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking enrollment:", checkError);
      return;
    }

    // Create enrollment if it doesn't exist
    if (!existingEnrollment) {
      const { error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          user_id: userId,
          course_id: courseId,
          purchased_at: new Date().toISOString(),
          amount_paid: 29.99,
        });

      if (enrollmentError) {
        console.error("Error creating sample enrollment:", enrollmentError);
        return;
      }

      console.log("Sample enrollment created successfully!");
      return true;
    } else {
      console.log("Enrollment already exists");
      return false;
    }
  } catch (err) {
    console.error("Error in createSampleEnrollment:", err);
    return false;
  }
}

export default function UserDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "all" });
  const [sortOption, setSortOption] = useState("newest");
  const [user, setUser] = useState(null);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const isTabVisible = usePageVisibility();
  const dataFetchRef = useRef(null);

  // Memoize fetch function with useCallback to prevent recreating it on each render
  const fetchUserAndCourses = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check database schema to diagnose issues
      await checkDatabaseSchema();

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      // Only fetch data if tab is visible to avoid unnecessary operations
      if (isTabVisible) {
        // Fetch enrolled courses
        try {
          console.log("Fetching enrolled courses for user:", session.user.id);
          const enrolledCourses = await getEnrolledCourses(session.user.id);
          console.log("Enrolled courses result:", enrolledCourses);

          // Even if we get an empty array, that's fine - just show no courses
          setCourses(enrolledCourses || []);
          setFilteredCourses(
            filterAndSortEnrolledCourses(
              enrolledCourses || [],
              filters,
              sortOption
            )
          );
        } catch (courseError) {
          console.error("Dashboard caught error:", courseError);
          // Don't set error state, just show empty courses
          setCourses([]);
          setFilteredCourses([]);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load your dashboard. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [router, isTabVisible, filters, sortOption]);

  // Fetch user and enrolled courses when component mounts or tab becomes visible
  useEffect(() => {
    // Don't need to fetch again if we already have courses and tab is just becoming visible
    if (isTabVisible) {
      fetchUserAndCourses();
    }

    return () => {
      // Cancel any pending data fetches if component unmounts
      if (dataFetchRef.current) {
        clearTimeout(dataFetchRef.current);
      }
    };
  }, [fetchUserAndCourses, isTabVisible]);

  // Apply filters and sorting when they change
  useEffect(() => {
    if (courses.length > 0) {
      const filtered = filterAndSortEnrolledCourses(
        courses,
        filters,
        sortOption
      );
      setFilteredCourses(filtered);
    }
  }, [courses, filters, sortOption]);

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      status: e.target.value,
    });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Handle creating sample enrollment with debouncing to prevent multiple clicks
  const handleCreateSample = useCallback(async () => {
    if (!user || creatingDemo) return;

    setCreatingDemo(true);
    try {
      const created = await createSampleEnrollment(user.id);
      if (created) {
        // Refresh the page to show the new enrollment
        window.location.reload();
      } else {
        // Just refresh the enrollments
        const enrolledCourses = await getEnrolledCourses(user.id);
        setCourses(enrolledCourses || []);
        const filtered = filterAndSortEnrolledCourses(
          enrolledCourses || [],
          filters,
          sortOption
        );
        setFilteredCourses(filtered);
      }
    } catch (err) {
      console.error("Error creating sample enrollment:", err);
    } finally {
      setCreatingDemo(false);
    }
  }, [user, creatingDemo, filters, sortOption]);

  // Handle checking database schema
  const handleCheckSchema = async () => {
    try {
      const schema = await checkDatabaseSchema();
      console.log("Database schema check results:", schema);
      alert("Database schema check completed. See console for results.");
    } catch (err) {
      console.error("Error checking schema:", err);
      alert("Error checking database schema. See console for details.");
    }
  };

  // Show appropriate UI based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h3 className="text-red-600 dark:text-red-400 font-medium">Error</h3>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (filteredCourses.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven&apos;t enrolled in any courses yet or no courses match
            your current filters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/courses")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
            <button
              onClick={handleCreateSample}
              disabled={creatingDemo}
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors ${
                creatingDemo ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {creatingDemo ? "Creating..." : "Create Demo Enrollment"}
            </button>
            <button
              onClick={handleCheckSchema}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Check Database Schema
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <DashboardCourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        My Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Enrolled Courses
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            5
          </p>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Total Courses
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {courses.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                In Progress
              </h3>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {courses.filter((course) => !course.completed).length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Completed
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {courses.filter((course) => course.completed).length}
              </p>
            </div>
          </div>

          {/* Filtering and sorting controls */}
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              My Courses
            </h2>

            <div className="flex flex-wrap gap-4">
              <select
                value={filters.status}
                onChange={handleFilterChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Courses</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={sortOption}
                onChange={handleSortChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
              >
                <option value="newest">Most Recent</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="progress-asc">Progress (Low-High)</option>
                <option value="progress-desc">Progress (High-Low)</option>
              </select>
            </div>
          </div>

          {/* Courses grid */}
          {renderContent()}
        </div>
      </div>

      {/* Mobile navigation - hidden on desktop */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 p-2 flex justify-around lg:hidden">
        <a
          href="/dashboard"
          className="flex flex-col items-center p-2 text-blue-600 dark:text-blue-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-xs">Home</span>
        </a>
        <a
          href="/dashboard/progress"
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-xs">Progress</span>
        </a>
        <a
          href="/dashboard/account"
          className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-xs">Profile</span>
        </a>
      </div>
    </div>
  );
}
