export default function CourseDetails({ params }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Course Details</h1>
        <p className="text-lg mb-4">Course ID: {params.id}</p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Course Title</h2>
          <p className="text-gray-600 mb-4">
            This is a detailed view of the course. Here you would display course information,
            description, instructor details, and enrollment options.
          </p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
} 