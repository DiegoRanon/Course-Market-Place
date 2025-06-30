"use client";

import CourseCard from "@/app/components/CourseCard";

export default function CourseGrid({
  title = "Featured Courses",
  courses = [],
  emptyMessage = "No courses found",
  showCategory = true,
  showRating = true,
  showPrice = true,
  linkPath = "/courses",
}) {
  return (
    <div className="container mx-auto py-16">
      {title && (
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {courses.map((course) => (
            <CourseCard
              key={course.id || course.title}
              course={course}
              showCategory={showCategory}
              showRating={showRating}
              showPrice={showPrice}
              linkPath={linkPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
