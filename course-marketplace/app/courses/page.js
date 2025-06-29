"use client";

import { useState, useEffect } from "react";
import { getPublishedCourses } from "@/app/lib/api/courses";
import CourseCard from "@/app/components/CourseCard";
import LoadingState from "@/app/components/ui/LoadingState";
import ErrorState from "@/app/components/ui/ErrorState";
import EmptyState from "@/app/components/ui/EmptyState";
import PageContainer from "@/app/components/layout/PageContainer";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublishedCourses();
  }, []);

  const fetchPublishedCourses = async () => {
    try {
      setLoading(true);
      console.log("Fetching published courses in page component...");
      const { data, error } = await getPublishedCourses();

      if (error) {
        console.error("Error in courses page:", error);
        setError(error);
        setCourses([]);
      } else {
        console.log(`Received ${data?.length || 0} courses`);
        setCourses(data || []);
        setError(null);
      }
    } catch (err) {
      console.error("Exception in fetchPublishedCourses:", err);
      setError(err.message || "An unexpected error occurred");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Courses">
      {loading && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <LoadingState message="Loading courses..." />
        </div>
      )}

      {error && !loading && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <ErrorState
            title="Error Loading Courses"
            message="There was an error loading courses. Please try again later."
            details={error}
            onRetry={fetchPublishedCourses}
          />
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <EmptyState
            title="No courses available"
            message="Check back soon for new course offerings."
          />
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} showButton={false} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
