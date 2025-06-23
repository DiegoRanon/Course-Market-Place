export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Courses</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold text-green-600">156</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">$12,450</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Enrollments</h3>
          <p className="text-3xl font-bold text-orange-600">89</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Courses</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center">
              <span>React Fundamentals</span>
              <span className="text-sm text-gray-500">2 days ago</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Node.js Backend</span>
              <span className="text-sm text-gray-500">1 week ago</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Python for Beginners</span>
              <span className="text-sm text-gray-500">2 weeks ago</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Create New Course
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              View All Users
            </button>
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 