import Link from "next/link";

export default function DashboardCourseCard({ course }) {
  const {
    id,
    title,
    description,
    progress,
    imageUrl = null,
    completed = false,
  } = course;

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">
              Course Image
            </span>
          </div>
        )}
        {completed && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            COMPLETED
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100 line-clamp-1">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {description}
        </p>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`${
                completed
                  ? "bg-green-500 dark:bg-green-600"
                  : "bg-blue-500 dark:bg-blue-600"
              } h-2 rounded-full`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <Link href={`/learn/${id}`}>
          <button
            className={`w-full ${
              completed
                ? "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700"
                : "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700"
            } text-white py-2 px-4 rounded`}
          >
            {completed ? "View Certificate" : "Continue Learning"}
          </button>
        </Link>
      </div>
    </div>
  );
}
