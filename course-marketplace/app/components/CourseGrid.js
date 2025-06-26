"use client";

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
}) {
  const handleEnrollClick = (course, event) => {
    event.stopPropagation();
    if (onEnrollClick) {
      onEnrollClick(course);
    }
  };

  const handleCourseClick = (course) => {
    if (onCourseClick) {
      onCourseClick(course);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "fill-current" : "fill-gray-300"
        }`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Custom number formatting function to avoid hydration mismatch
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <section className={`py-16 ${backgroundClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className={`grid ${gridCols} gap-8`}>
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(course)}
            >
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {showCategory && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-sm font-medium">
                    {course.category}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  by {course.instructor}
                </p>

                {showRating && (
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {renderStars(course.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {course.rating}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({formatNumber(course.students)})
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {showPrice && (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900">
                        ${course.price}
                      </span>
                      {course.originalPrice && (
                        <span className="ml-2 text-lg text-gray-500 line-through">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                  {showEnrollButton && (
                    <button
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                      onClick={(e) => handleEnrollClick(course, e)}
                    >
                      {buttonText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
