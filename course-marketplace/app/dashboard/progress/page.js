"use client";

import DashboardSidebar from "../../components/dashboard/Sidebar";

export default function ProgressPage() {
  // Sample data for progress statistics
  const overallProgress = 68;
  const weeklyStats = {
    hoursSpent: 12.5,
    lessonsCompleted: 15,
    coursesProgress: 3,
    streak: 5,
  };

  // Sample course progress data
  const courseProgress = [
    {
      id: 1,
      title: "React Fundamentals",
      progress: 75,
      lessonsCompleted: 9,
      totalLessons: 12,
      category: "Web Development",
    },
    {
      id: 2,
      title: "Node.js Backend",
      progress: 45,
      lessonsCompleted: 5,
      totalLessons: 11,
      category: "Web Development",
    },
    {
      id: 3,
      title: "Python for Beginners",
      progress: 100,
      lessonsCompleted: 14,
      totalLessons: 14,
      category: "Programming",
    },
    {
      id: 4,
      title: "JavaScript ES6+",
      progress: 20,
      lessonsCompleted: 2,
      totalLessons: 10,
      category: "Web Development",
    },
    {
      id: 5,
      title: "CSS Grid & Flexbox",
      progress: 100,
      lessonsCompleted: 8,
      totalLessons: 8,
      category: "Web Design",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Learning Progress
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - visible on large screens */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Overall Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Overall Progress
            </h2>
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-4 md:mb-0 md:mr-8 relative h-40 w-40 flex items-center justify-center">
                {/* Progress circle */}
                <svg className="h-40 w-40" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="10"
                    className="dark:stroke-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeDasharray={`${overallProgress * 2.83} 283`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transform -rotate-90 origin-center"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {overallProgress}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-grow">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hours Spent
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {weeklyStats.hoursSpent}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lessons Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {weeklyStats.lessonsCompleted}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Course Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {weeklyStats.coursesProgress}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Day Streak
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {weeklyStats.streak}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Your Courses
            </h2>
            <div className="space-y-6">
              {courseProgress.map((course) => (
                <div
                  key={course.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {course.title}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md mt-1">
                        {course.category}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        course.progress === 100
                          ? "text-green-600 dark:text-green-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {course.lessonsCompleted} / {course.totalLessons} lessons
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          course.progress === 100
                            ? "bg-green-500 dark:bg-green-600"
                            : "bg-blue-500 dark:bg-blue-600"
                        }`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation - visible only on small screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 lg:hidden z-50">
        <div className="flex justify-around">
          <a
            href="/dashboard"
            className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-400"
          >
            <span className="text-xl">📚</span>
            <span className="text-xs mt-1">Courses</span>
          </a>
          <a
            href="/dashboard/progress"
            className="flex flex-col items-center py-2 px-3 text-blue-500 dark:text-blue-400"
          >
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">Progress</span>
          </a>
          <a
            href="/dashboard/account"
            className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-400"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1">Account</span>
          </a>
        </div>
      </div>
    </div>
  );
}
