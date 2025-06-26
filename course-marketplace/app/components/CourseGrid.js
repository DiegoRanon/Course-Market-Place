"use client";

import CourseCard from '@/app/components/CourseCard';

export default function CourseGrid({
  title = "Featured Courses",
  courses = [
    {
      title: "React Fundamentals",
      instructor: "John Doe",
      rating: 4.8,
      students: 15420,
      price: 89.99,
      originalPrice: 199.99,
      image: "https://via.placeholder.com/300x200/6366f1/ffffff?text=React",
      category: "Programming",
    },
    {
      title: "Complete Web Development",
      instructor: "Jane Smith",
      rating: 4.9,
      students: 23450,
      price: 129.99,
      originalPrice: 299.99,
      image: "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Web+Dev",
      category: "Programming",
    },
    {
      title: "UI/UX Design Masterclass",
      instructor: "Mike Johnson",
      rating: 4.7,
      students: 12340,
      price: 79.99,
      originalPrice: 179.99,
      image: "https://via.placeholder.com/300x200/10b981/ffffff?text=Design",
      category: "Design",
    },
    {
      title: "Digital Marketing Strategy",
      instructor: "Sarah Wilson",
      rating: 4.6,
      students: 9870,
      price: 69.99,
      originalPrice: 159.99,
      image: "https://via.placeholder.com/300x200/ef4444/ffffff?text=Marketing",
      category: "Marketing",
    },
    {
      title: "Python for Beginners",
      instructor: "David Brown",
      rating: 4.8,
      students: 18760,
      price: 59.99,
      originalPrice: 139.99,
      image: "https://via.placeholder.com/300x200/f59e0b/ffffff?text=Python",
      category: "Programming",
    },
    {
      title: "Business Analytics",
      instructor: "Lisa Chen",
      rating: 4.5,
      students: 7650,
      price: 99.99,
      originalPrice: 219.99,
      image: "https://via.placeholder.com/300x200/06b6d4/ffffff?text=Analytics",
      category: "Business",
    },
  ],
  backgroundClass = "",
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  onEnrollClick = null,
  onCourseClick = null,
  showCategory = true,
  showRating = true,
  showPrice = true,
  showEnrollButton = true,
  buttonText = "Enroll Now",
  linkPath = "/courses",
}) {
  const handleEnrollClick = (course) => {
    if (onEnrollClick) {
      onEnrollClick(course);
    }
  };

  const handleCourseClick = (course) => {
    if (onCourseClick) {
      onCourseClick(course);
    }
  };

  return (
    <section className={`py-16 ${backgroundClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}
        <div className={`grid ${gridCols} gap-8`}>
          {courses.map((course, index) => (
            <CourseCard
              key={course.id || index}
              course={course}
              showCategory={showCategory}
              showRating={showRating}
              showPrice={showPrice}
              showButton={showEnrollButton}
              buttonText={buttonText}
              onButtonClick={handleEnrollClick}
              linkPath={linkPath}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
