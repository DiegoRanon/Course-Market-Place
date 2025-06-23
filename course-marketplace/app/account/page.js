export default function UserAccount() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <div className="max-w-2xl">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                defaultValue="John"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                defaultValue="Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                rows="3"
                defaultValue="Software developer passionate about learning new technologies."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Update Profile
            </button>
          </form>
        </div>
        
        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>
            
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Change Password
            </button>
          </form>
        </div>
        
        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Delete Account</h3>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Delete
              </button>
            </div>
            
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-gray-500">Download all your course data and progress</p>
              </div>
              <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 