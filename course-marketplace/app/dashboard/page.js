export default function UserDashboard() {
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Completed
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            2
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            In Progress
          </h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            3
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          My Courses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course Card 1 */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">
                Course Image
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                React Fundamentals
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Learn React from scratch with this comprehensive course
              </p>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <button className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-600 dark:hover:bg-blue-700">
                Continue Learning
              </button>
            </div>
          </div>

          {/* Course Card 2 */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">
                Course Image
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                Node.js Backend
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Build scalable backend applications with Node.js
              </p>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                  <span>Progress</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
              <button className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-600 dark:hover:bg-blue-700">
                Continue Learning
              </button>
            </div>
          </div>

          {/* Course Card 3 */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">
                Course Image
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                Python for Beginners
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Start your programming journey with Python
              </p>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                  <span>Progress</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 dark:bg-green-600 h-2 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
              <button className="w-full bg-green-500 dark:bg-green-600 text-white py-2 px-4 rounded hover:bg-green-600 dark:hover:bg-green-700">
                View Certificate
              </button>
            </div>
          </div>

          {/* Course Card 4 */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">
                Course Image
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                JavaScript ES6+
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Master modern JavaScript features
              </p>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                  <span>Progress</span>
                  <span>20%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
              <button className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-600 dark:hover:bg-blue-700">
                Continue Learning
              </button>
            </div>
          </div>

          {/* Course Card 5 */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">
                Course Image
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                CSS Grid & Flexbox
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Master modern CSS layout techniques
              </p>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                  <span>Progress</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 dark:bg-green-600 h-2 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
              <button className="w-full bg-green-500 dark:bg-green-600 text-white py-2 px-4 rounded hover:bg-green-600 dark:hover:bg-green-700">
                View Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
