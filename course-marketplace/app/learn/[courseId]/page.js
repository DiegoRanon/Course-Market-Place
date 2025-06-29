"use client";

import { useParams } from "next/navigation";

export default function CourseViewer() {
  const params = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Course Viewer</h1>
        <p className="text-lg mb-4">Course ID: {params?.courseId}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg aspect-video mb-4">
              <div className="flex items-center justify-center h-full text-white">
                <p>Video Player Placeholder</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Current Lesson Title</h2>
            <p className="text-gray-600">Lesson description and content...</p>
          </div>

          {/* Progress Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "25%" }}
                ></div>
              </div>
            </div>

            <h4 className="font-medium mb-2">Course Content</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                <span>Introduction</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                <span>Current Lesson</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-gray-300 rounded-full mr-2"></span>
                <span>Next Lesson</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
