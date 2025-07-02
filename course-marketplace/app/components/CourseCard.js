"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";

export default function CourseCard({
  course,
  showCategory = true,
  showPrice = true,
  showRating = true,
  linkPath = "/courses",
  showButton = false,
  buttonText = "Enroll Now",
  onButtonClick = null,
}) {
  // Custom number formatting function to avoid hydration mismatch
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400"
            : "fill-gray-300 dark:fill-gray-600"
        }`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (onButtonClick) {
      onButtonClick(course);
    }
  };

  // Function to get the proper thumbnail URL
  const getThumbnailUrl = (url) => {
    if (!url) return null;

    // If it's already a full URL
    if (url.startsWith("http")) {
      return url;
    }

    // If it's a storage path in course-thumbnails bucket
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${url}`;
  };

  const courseContent = (
    <>
      <div className="relative h-48">
        {course.thumbnail_url ? (
          <div className="relative w-full h-full">
            <Image
              src={getThumbnailUrl(course.thumbnail_url)}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">No image</span>
          </div>
        )}

        {showCategory && course.category_name && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-sm font-medium">
            {course.category_name}
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
          {course.title}
        </h3>

        {course.instructor && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            by {course.instructor}
          </p>
        )}

        {showRating && course.rating && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {renderStars(course.rating)}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {course.rating}
            </span>
            {course.students && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-500">
                ({formatNumber(course.students)})
              </span>
            )}
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {course.short_description || course.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          {showPrice && (
            <div className="flex items-center">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {course.price
                  ? `$${parseFloat(course.price).toFixed(2)}`
                  : "Free"}
              </span>
              {course.originalPrice && (
                <span className="ml-2 text-gray-500 dark:text-gray-500 line-through">
                  ${parseFloat(course.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          )}

          {showButton && (
            <button
              onClick={handleButtonClick}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </>
  );

  return course.id && !showButton ? (
    <Link
      href={`${linkPath}/${course.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col transition-transform hover:shadow-lg hover:-translate-y-1"
    >
      {courseContent}
    </Link>
  ) : (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
      {courseContent}
    </div>
  );
}
